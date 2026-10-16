# Python-WebSockets

Cliente manda frase. Servidor deixa frase GRANDE. Servidor devolve. Cliente mostra.

Precisa Python 3.14.

## Instalar com uv (jeito fácil)

Professor ter `uv`. Professor entrar na pasta. Professor bater:

```sh
uv sync
```

Pronto. uv faz tudo sozinho.

## Instalar com pip (jeito velho)

Professor criar caverna (venv):

```sh
python -m venv .venv
```

Professor entrar na caverna:

```sh
source .venv/bin/activate     # Linux / Mac
.venv\Scripts\activate        # Windows
```

Professor instalar coisa:

```sh
pip install .
```

## Rodar

Primeiro servidor. Servidor ouvir na porta 8000.

```sh
uv run servidor     # com uv
servidor            # com pip (caverna ativada)
```

Depois cliente, em outro terminal:

```sh
uv run cliente      # com uv
cliente             # com pip (caverna ativada)
```

Cliente pedir frase. Professor digitar. Servidor devolver frase GRANDE. Ctrl+D fazer cliente ir embora.

## Duas máquinas

Servidor em uma máquina, cliente em outra. Cliente precisar saber IP do servidor:

```sh
uv run cliente ws://<ip-do-servidor>:8000/ws
```

Porta 8000 precisar estar aberta no firewall do servidor.

Quer outra porta? Professor mudar:

```sh
PORT=9000 uv run servidor
```
