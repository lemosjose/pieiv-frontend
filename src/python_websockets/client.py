"""
Parte do cliente, lê do teclado + printa na tela em linha maiúscula
"""
import sys
from websockets.sync.client import connect

def main() -> None:
    url: str = sys.argv[1] if len(sys.argv) > 1 else "ws://localhost:8000/ws"
    with connect(url) as websocket:
        print(f"[cliente] conectado a {url} (Ctrl+D para sair)")
        while True:
            try:
                line: str = input("Digite uma frase: ")
            except EOFError:
                break
            websocket.send(line)
            modified: str = websocket.recv(decode=True)
            print(f"Do servidor: {modified}")
