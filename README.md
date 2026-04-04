<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/6wj0hh6.jpg" alt="Project logo"></a>
</p>

<h3 align="center">Inquira AI</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
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


### Installing

Installing the backend by go to the backend folder, install the dependency by using any of the python package managers like uv, pip,...

```
pip install .
```

Then run the backend
```
run
```

Go to the frontend folder, run

```
npm install
```

Then wait until it done, run

```
npm run dev
```
<!-- 
## Running the tests <a name = "tests"></a>

Explain how to run the automated tests for this system.

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
``` -->

## Deployment <a name = "deployment"></a>

On production, we build the frontend for deploy, backend still the same.

```
npm run build
```

## Built Using <a name = "built_using"></a>

- [pgVector](https://github.com/pgvector/pgvector) - Database
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
