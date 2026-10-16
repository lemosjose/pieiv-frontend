"""
Recebe linha do cliente + capitaliza todos os caracteres
"""
import os
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app: FastAPI = FastAPI()

@app.websocket("/ws")
async def uppercase(websocket: WebSocket) -> None:
    await websocket.accept()
    client: str = (
        f"{websocket.client.host}:{websocket.client.port}" if websocket.client else "desconhecido"
    )
    print(f"[servidor] conexão aceita de {client}")
    try:
        while True:
            line: str = await websocket.receive_text()
            upper: str = line.upper()
            print(f"[servidor] recebido de {client}: {line!r} -> enviado: {upper!r}")
            await websocket.send_text(upper)
    except WebSocketDisconnect:
        print(f"[servidor] {client} desconectou")


def main() -> None:
    """
    nota: eu nunca tipo fortemente variáveis de ambiente, se por acaso meu lsp (basedpyright) foi no zip e ficou chiando, pode ignorar
    """
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    print(f"[servidor] escutando em ws://{host}:{port}/ws")
    uvicorn.run(app, host=host, port=port, log_level="warning")
