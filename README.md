# Projeto de Teste In8 Holding (Versão TypeScript)

Este projeto é um serviço de web scraping desenvolvido em **TypeScript** que coleta dados de laptops de um site de e-commerce, processa essas informações e as armazena para análise. Ele também fornece uma API para acessar e filtrar os dados armazenados.

## Compatibilidade

Este projeto foi desenvolvido e testado em um ambiente **Windows**, mas também foi executado com sucesso em um **MacBook Pro M3 Max**. Deve funcionar em ambientes **Linux** também, embora não tenha sido explicitamente testado lá.

## Tecnologias Utilizadas

- **TypeScript**: Linguagem de programação usada para o desenvolvimento.
- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework web para Node.js.
- **Axios**: Cliente HTTP baseado em Promessas para o navegador e Node.js.
- **Cheerio**: Implementação rápida, flexível e leve do núcleo do jQuery projetada especificamente para o servidor.
- **Puppeteer**: Biblioteca Node.js que fornece uma API de alto nível para controlar o Chrome ou Chromium via DevTools Protocol.
- **MySQL**: Sistema de gerenciamento de banco de dados relacional.
- **dotenv**: Módulo que carrega variáveis de ambiente de um arquivo `.env`.
- **cron**: Agendador de tarefas baseado em tempo.

## Estrutura do Projeto

- `src/config`: Configurações do projeto, como variáveis de ambiente e configurações do banco de dados.
- `src/controllers`: Controladores responsáveis por manipular as requisições e respostas da API.
- `src/models`: Modelos de dados usados no projeto.
- `src/routes`: Definições das rotas da API.
- `src/services/DatabaseService.ts`: Serviço responsável por interagir com o banco de dados.
- `src/services/WebScrapingService.ts`: Serviço responsável por realizar o web scraping e processar os dados coletados.
- `src/types/ScrapeData.ts`: Definições de tipos para os dados raspados.
- `src/types/ProcessedData.ts`: Definições de tipos para os dados processados.
- `src/app.ts`: Arquivo principal da aplicação que configura o servidor Express.

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```

2. **Navegue até o diretório do projeto:**

   ```bash
   cd seu-repositorio
   ```

3. **Instale as dependências:**

   ```bash
   npm install
   ```

4. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto e adicione suas variáveis de ambiente, deixei um .env.example:

   ```env
   # Configuração do banco de dados
   DB_HOST=localhost
   DB_USER=seu-usuario
   DB_PASSWORD=sua-senha
   DB_NAME=nome-do-banco-de-dados

   # Configuração do servidor
   PORT=3000
   ```

## Uso

### Iniciando os Serviços com Docker Compose

Para iniciar os serviços necessários, execute o seguinte comando (por favor, aguarde antes de sincronizar os dados):

```bash
docker-compose up --build
```

Este comando irá construir e executar os contêineres Docker definidos no arquivo `docker-compose.yml`, que devem incluir a aplicação Node.js e o banco de dados MySQL.

### Sincronizando Dados

Para iniciar a raspagem de dados e salvá-los no banco de dados, acesse a rota `/notebook/sync`. Observe que este processo pode levar algum tempo (aproximadamente 2 minutos):

```bash
http://localhost:3000/notebook/sync
```

Você pode especificar o parâmetro `chunkSize` para definir o número de itens processados simultaneamente. Se você estiver usando um computador menos potente, considere reduzir o tamanho do chunk:

```bash
http://localhost:3000/notebook/sync?chunkSize=15
```

### Obtendo Produtos

Para recuperar os produtos armazenados no banco de dados, acesse a rota `/notebook/get`. Isso irá buscar os dados conforme solicitado para o teste (por exemplo, laptops Lenovo ordenados por preço em ordem crescente):

```bash
http://localhost:3000/notebook/get
```

Você pode filtrar os produtos e ordenar por preço usando os parâmetros de consulta `item` e `orderBy`:

```bash
http://localhost:3000/notebook/get?item=Dell&orderBy=DESC
```

### Executando a Aplicação Sem Docker

Se você prefere executar a aplicação sem Docker, siga estes passos:

1. **Inicie o Servidor MySQL:**

   Certifique-se de que você tem o MySQL instalado e em execução. Crie um banco de dados com o nome especificado em seu arquivo `.env`.

2. **Compile o Código TypeScript:**

   ```bash
   npm run build
   ```

3. **Inicie a Aplicação:**

   ```bash
   npm start
   ```

## Endpoints da API

### `GET /notebook/sync`

Inicia o processo de raspagem de dados e salva os dados no banco de dados.

- **Parâmetros de Consulta:**
    - `chunkSize` (opcional): Número de itens a serem processados simultaneamente. O padrão é `30`.

### `GET /notebook/get`

Recupera os produtos do banco de dados.

- **Parâmetros de Consulta:**
    - `item` (opcional): Filtra produtos pelo nome do item (por exemplo `Dell`), o padrão é `Lenovo`.
    - `orderBy` (opcional): Ordena os resultados por preço. Use `ASC` para ascendente ou `DESC` para descendente. O padrão é `ASC`.

## Notas

- **Considerações de Desempenho:**

    - O processo de raspagem pode consumir muitos recursos. Ajuste o parâmetro `chunkSize` com base nas capacidades do seu sistema.
    - O `chunkSize` padrão é `30`, mas se você encontrar problemas de desempenho, tente reduzi-lo para `10` ou `15`.

- **Armazenamento de Dados:**

    - Os dados raspados são armazenados em um banco de dados MySQL. Certifique-se de que suas credenciais de banco de dados no arquivo `.env` estão corretas.

- **Tratamento de Erros:**

    - A aplicação inclui tratamento de erros para capturar e registrar problemas durante as etapas de raspagem e processamento de dados.
    - Verifique a saída do console para quaisquer mensagens de erro se você encontrar problemas.

## Solução de Problemas

- **Problemas Comuns:**

    - *Erros de Conexão com o Banco de Dados:*
        - Certifique-se de que seu servidor MySQL está em execução e que as credenciais no seu arquivo `.env` estão corretas.
    - *Uso Elevado de Memória:*
        - O processo de raspagem usa o Puppeteer, que pode consumir muita memória. Reduza o `chunkSize` se você experimentar alto uso de memória.
    - *Timeouts ou Desempenho Lento:*
        - Problemas de rede podem causar timeouts. Certifique-se de que você tem uma conexão de internet estável.

- **Logs:**

    - Verifique a saída do console para logs que possam ajudar a diagnosticar problemas.
    - Implemente logs adicionais conforme necessário para uma solução de problemas mais detalhada.