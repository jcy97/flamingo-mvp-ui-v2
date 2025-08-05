import { atom } from "jotai";
import * as PIXI from "pixi.js";

export interface PixiState {
  app: PIXI.Application | null;
  isInitialized: boolean;
  // 페이지별 -> 캔버스별 컨테이너 구조
  pageContainers: Record<string, Record<string, PIXI.Container>>; // [pageId][canvasId]
  // 현재 활성 상태
  activePageId: string | null;
  activeCanvasId: string | null;
  activeLayerId: string | null;
}

// 기본 PIXI 상태
export const pixiStateAtom = atom<PixiState>({
  app: null,
  isInitialized: false,
  pageContainers: {},
  activePageId: null,
  activeCanvasId: null,
  activeLayerId: null,
});

// PIXI Application 초기화
export const initPixiAppAtom = atom(null, async (get, set) => {
  const state = get(pixiStateAtom);
  if (state.isInitialized || state.app) return;

  try {
    const app = new PIXI.Application();
    await app.init({
      width: 800,
      height: 600,
      backgroundColor: 0xffffff,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    set(pixiStateAtom, {
      ...state,
      app,
      isInitialized: true,
    });

    console.log("PIXI Application 초기화 완료");
  } catch (error) {
    console.error("PIXI Application 초기화 실패:", error);
  }
});

// 페이지 컨테이너 생성
export const createPageContainersAtom = atom(
  null,
  (get, set, pageId: string) => {
    const state = get(pixiStateAtom);
    if (!state.app || state.pageContainers[pageId]) return;

    set(pixiStateAtom, {
      ...state,
      pageContainers: {
        ...state.pageContainers,
        [pageId]: {},
      },
    });

    console.log(`페이지 컨테이너 생성: ${pageId}`);
  }
);

// 캔버스 컨테이너 생성
export const createCanvasContainerAtom = atom(
  null,
  (get, set, { pageId, canvasId }: { pageId: string; canvasId: string }) => {
    const state = get(pixiStateAtom);
    if (!state.app) {
      console.warn("PIXI App이 초기화되지 않았습니다.");
      return;
    }

    if (state.pageContainers[pageId]?.[canvasId]) {
      console.warn(`캔버스 컨테이너가 이미 존재합니다: ${pageId}/${canvasId}`);
      return;
    }

    // 페이지 컨테이너가 없으면 생성
    if (!state.pageContainers[pageId]) {
      set(pixiStateAtom, {
        ...state,
        pageContainers: {
          ...state.pageContainers,
          [pageId]: {},
        },
      });
    }

    const container = new PIXI.Container();
    container.name = `canvas-${canvasId}`;

    const currentState = get(pixiStateAtom);
    set(pixiStateAtom, {
      ...currentState,
      pageContainers: {
        ...currentState.pageContainers,
        [pageId]: {
          ...currentState.pageContainers[pageId],
          [canvasId]: container,
        },
      },
    });

    console.log(`캔버스 컨테이너 생성: ${pageId}/${canvasId}`);
  }
);

// 페이지 전환
export const switchPageAtom = atom(null, (get, set, pageId: string) => {
  const state = get(pixiStateAtom);
  if (!state.app || state.activePageId === pageId) return;

  // 현재 스테이지의 모든 컨테이너 제거
  state.app.stage.removeChildren();

  // 새 페이지의 컨테이너들 추가
  const pageContainers = state.pageContainers[pageId];
  if (pageContainers) {
    Object.values(pageContainers).forEach((container) => {
      state.app!.stage.addChild(container);
    });
    console.log(
      `페이지 전환: ${pageId}, 컨테이너 ${
        Object.keys(pageContainers).length
      }개 로드`
    );
  } else {
    console.warn(`페이지 컨테이너를 찾을 수 없습니다: ${pageId}`);
  }

  set(pixiStateAtom, {
    ...state,
    activePageId: pageId,
  });
});

// 캔버스 전환
export const switchCanvasAtom = atom(null, (get, set, canvasId: string) => {
  const state = get(pixiStateAtom);

  set(pixiStateAtom, {
    ...state,
    activeCanvasId: canvasId,
  });

  console.log(`캔버스 전환: ${canvasId}`);
});

// 레이어 전환
export const switchLayerAtom = atom(null, (get, set, layerId: string) => {
  const state = get(pixiStateAtom);
  console.log(state);
  set(pixiStateAtom, {
    ...state,
    activeLayerId: layerId,
  });

  console.log(`레이어 전환: ${layerId}`);
});

// 캔버스 컨테이너 가져오기
export const getCanvasContainerAtom = atom((get) => {
  const state = get(pixiStateAtom);
  if (!state.activePageId || !state.activeCanvasId) return null;

  return (
    state.pageContainers[state.activePageId]?.[state.activeCanvasId] || null
  );
});

// 페이지 정리
export const cleanupPageAtom = atom(null, (get, set, pageId: string) => {
  const state = get(pixiStateAtom);

  // 페이지의 모든 컨테이너와 하위 요소들 정리
  const pageContainers = state.pageContainers[pageId];
  if (pageContainers) {
    Object.entries(pageContainers).forEach(([canvasId, container]) => {
      // 스테이지에서 제거
      if (container.parent) {
        container.parent.removeChild(container);
      }

      // 컨테이너와 모든 자식 요소 정리
      container.destroy({
        children: true,
        texture: true,
      });

      console.log(`캔버스 컨테이너 정리: ${pageId}/${canvasId}`);
    });
  }

  // 상태에서 제거
  const newPageContainers = { ...state.pageContainers };
  delete newPageContainers[pageId];

  set(pixiStateAtom, {
    ...state,
    pageContainers: newPageContainers,
    activePageId: state.activePageId === pageId ? null : state.activePageId,
  });

  console.log(`페이지 정리 완료: ${pageId}`);
});

// 캔버스 정리
export const cleanupCanvasAtom = atom(
  null,
  (get, set, { pageId, canvasId }: { pageId: string; canvasId: string }) => {
    const state = get(pixiStateAtom);

    // 컨테이너 정리
    const container = state.pageContainers[pageId]?.[canvasId];
    if (container) {
      // 스테이지에서 제거
      if (container.parent) {
        container.parent.removeChild(container);
      }

      // 컨테이너와 모든 자식 요소 정리
      container.destroy({
        children: true,
        texture: true,
      });
    }

    // 상태에서 제거
    const newPageContainers = { ...state.pageContainers };
    if (newPageContainers[pageId]) {
      const newCanvases = { ...newPageContainers[pageId] };
      delete newCanvases[canvasId];
      newPageContainers[pageId] = newCanvases;
    }

    set(pixiStateAtom, {
      ...state,
      pageContainers: newPageContainers,
      activeCanvasId:
        state.activeCanvasId === canvasId ? null : state.activeCanvasId,
    });

    console.log(`캔버스 정리 완료: ${pageId}/${canvasId}`);
  }
);

// PIXI Application 정리
export const destroyPixiAppAtom = atom(null, (get, set) => {
  const state = get(pixiStateAtom);

  if (state.app) {
    // 모든 컨테이너 정리
    Object.keys(state.pageContainers).forEach((pageId) => {
      Object.keys(state.pageContainers[pageId]).forEach((canvasId) => {
        const container = state.pageContainers[pageId][canvasId];
        container?.destroy({
          children: true,
          texture: true,
        });
      });
    });

    // PIXI Application 정리
    state.app.destroy();
    console.log("PIXI Application 정리 완료");
  }

  set(pixiStateAtom, {
    app: null,
    isInitialized: false,
    pageContainers: {},
    activePageId: null,
    activeCanvasId: null,
    activeLayerId: null,
  });
});

// 디버그용 상태 출력
export const debugPixiStateAtom = atom((get) => {
  const state = get(pixiStateAtom);
  return {
    isInitialized: state.isInitialized,
    appExists: !!state.app,
    pagesCount: Object.keys(state.pageContainers).length,
    canvasesCount: Object.values(state.pageContainers).reduce(
      (total, page) => total + Object.keys(page).length,
      0
    ),
    activePageId: state.activePageId,
    activeCanvasId: state.activeCanvasId,
    activeLayerId: state.activeLayerId,
  };
});
