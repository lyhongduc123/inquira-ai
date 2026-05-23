<p align="center">
  <a href="" rel="noopener">
 <img width=150px height=150px src="./src/frontend/public/logo.svg" alt="Project logo"></a>
</p>

<h3 align="center">Inquira AI</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
<!-- [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE) -->
<!-- [![GitHub Issues](https://img.shields.io/github/issues/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kylelobo/The-Documentation-Compendium.svg)](https://github.com/kylelobo/The-Documentation-Compendium/pulls) -->

</div>

---

<p align="center"> An AI-powered academic search engine. 
    <br> 
</p>

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Built Using](#built_using)
- [Authors](#authors)
<!-- - [Usage](#usage) -->
<!-- - [Contributing](../CONTRIBUTING.md) -->
<!-- - [Acknowledgments](#acknowledgement) -->

## About <a name = "about"></a>

This project is a result of a Bachelor's degree at University of Engineering and Technology - VNU. 

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

The projects contain pre-configured LLMs API providers and also local embeddings such as nomic-embed-text.

So creating API keys and installing nomic is a must.

Frontend using Next.js, so make sure you have npm installed

Backend using fastapi, so have your uv or python installed. 

## Local Development

Start the backend first, then the frontend.

Backend:

```powershell
cd backend-inquira
.\.venv\Scripts\Activate.ps1
run
```

Frontend:

```powershell
cd frontend-inquira
npm install
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
API docs: http://localhost:8000/docs
```

## Production
For detailed production deployment, please go to each repository details instead.
- Backend [README.md](./src/backend/README.md)
- Frontend [README.md](./src/frontend/README.md)

## Built Using <a name = "built_using"></a>

- [pgVector](https://github.com/pgvector/pgvector) w/ [pg_search](https://github.com/paradedb/paradedb/) - Database
- [Fastapi](https://fastapi.tiangolo.com/) - Server Framework
- [Next.js](https://nextjs.org/) - Web Framework
- [Shadcn](https://ui.shadcn.com/) - Web design library

## Authors <a name = "authors"></a>

- [@lyhongduc123](https://github.com/kylelobo) - Idea & Initial work
<!-- 
## Acknowledgements <a name = "acknowledgement"></a>

- Hat tip to anyone whose code was used
- Inspiration
- References -->
