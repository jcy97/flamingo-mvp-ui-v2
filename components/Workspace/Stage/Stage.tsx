"use client";
import React, { useCallback, useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

function Stage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  //브러쉬 스트로크 그리기
  const drawBrushStroke = useCallback((x: number, y: number) => {
    if (!appRef.current) return;

    //검은색 원그리기
    const circle = new PIXI.Graphics();
    circle.beginFill(0x000000, 1); // // 검은색, 불투명
    circle.drawCircle(0, 0, 10); // 반지름 10px
    circle.endFill();
    circle.x = x;
    circle.y = y;

    appRef.current.stage.addChild(circle);
  }, []);

  //보간 선 그리기
  const drawInterpolatedLine = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const spacing = 5; // 점 간격
      const steps = Math.max(1, Math.ceil(distance / spacing));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        drawBrushStroke(x, y);
      }
    },
    [drawBrushStroke]
  );

  //PIXI JS 초기화
  useEffect(() => {
    if (!canvasRef.current) return;
    const initApp = async () => {
      try {
        console.log("드로잉 엔진 초기화");
        const app = new PIXI.Application();
        await app.init({
          width: 800,
          height: 600,
          backgroundColor: 0xffffff,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!canvasRef.current) return;

        appRef.current = app;
        canvasRef.current.appendChild(app.canvas);

        // 캔버스 스타일 설정
        const canvas = app.canvas;
        canvas.style.cursor = "crosshair";
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        // 좌표 변환 함수
        const getCanvasCoordinates = (clientX: number, clientY: number) => {
          const rect = canvas.getBoundingClientRect();
          const scaleX = 800 / rect.width;
          const scaleY = 600 / rect.height;

          return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
          };
        };

        // 마우스 이벤트 핸들러
        const handleMouseDown = (event: MouseEvent) => {
          event.preventDefault();
          console.log("그리기 시작");

          isDrawingRef.current = true;
          const coords = getCanvasCoordinates(event.clientX, event.clientY);
          lastPointRef.current = coords;
          drawBrushStroke(coords.x, coords.y);
        };

        const handleMouseMove = (event: MouseEvent) => {
          if (!isDrawingRef.current || !lastPointRef.current) return;
          event.preventDefault();

          const coords = getCanvasCoordinates(event.clientX, event.clientY);

          // 이전 지점과 현재 지점 사이를 보간하여 그리기
          drawInterpolatedLine(
            lastPointRef.current.x,
            lastPointRef.current.y,
            coords.x,
            coords.y
          );

          lastPointRef.current = coords;
        };

        const handleMouseUp = (event: MouseEvent) => {
          event.preventDefault();
          console.log("그리기 종료");
          isDrawingRef.current = false;
          lastPointRef.current = null;
        };

        const handleMouseLeave = () => {
          console.log("마우스 캔버스 벗어남");
          isDrawingRef.current = false;
          lastPointRef.current = null;
        };

        // 이벤트 리스너 등록
        canvas.addEventListener("mousedown", handleMouseDown, {
          passive: false,
        });
        canvas.addEventListener("mousemove", handleMouseMove, {
          passive: false,
        });
        canvas.addEventListener("mouseup", handleMouseUp, { passive: false });
        canvas.addEventListener("mouseleave", handleMouseLeave, {
          passive: false,
        });

        console.log("마우스 이벤트 리스너 등록 완료");

        console.log("드로잉 엔진 초기화 완료");

        //정리 함수
        return () => {
          console.log("캔버스 정리");
          canvas.removeEventListener("mousedown", handleMouseDown);
          canvas.removeEventListener("mousemove", handleMouseMove);
          canvas.removeEventListener("mouseup", handleMouseUp);
          canvas.removeEventListener("mouseleave", handleMouseLeave);
          if (
            canvasRef.current &&
            app.canvas &&
            canvasRef.current.contains(app.canvas)
          ) {
            canvasRef.current.removeChild(app.canvas);
          }
          app.destroy();
        };
      } catch (error) {
        console.error("드로잉 엔진 초기화 실패", error);
      }
    };
    const cleanUp = initApp();
    return () => {
      cleanUp.then((cleanupFn) => cleanupFn && cleanupFn);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* 스테이지(PIXIJS) */}
      <div
        ref={canvasRef}
        className="border-4 border-gray-300 rounded-lg"
        style={{ width: "800px", height: "600px", backgroundColor: "#f8f8f8" }}
      ></div>
    </div>
  );
}

export default Stage;
