# Taskflow frontend

React and Vite frontend for the [Module 4 Spring Boot API](../module4-taskflow-api/README.md).
Supports listing, adding, editing, completing, and deleting tasks, plus AI summaries.

## Local development (WSL)

Use Linux Node.js and npm in your WSL terminal (Node.js 22.12+ recommended).
If `which npm` points under `/mnt/c/`, load your WSL nvm installation with
`source ~/.bashrc` and select your installed Node version with `nvm use`.
`node -p "process.platform"` must print `linux`, and `which npm` must point to a
Linux path before running the commands below.

1. Run the Spring Boot backend on port 8080. It requires `OPENAI_API_KEY` in its
   server environment; a valid key is needed for AI summaries. Never put this key
   in frontend code or a `VITE_` variable.
2. From this directory, install dependencies with `npm install` if needed.
3. Optionally copy `.env.example` to `.env.local` and change `API_PROXY_TARGET`
   when using a different backend host or port.
4. Run `npm run dev` and open the URL printed by Vite.

The browser uses relative `/api/tasks` URLs. Vite forwards `/api` requests to
`http://localhost:8080` by default, so no backend CORS changes are needed for
local development. Restart Vite after changing environment settings.
Tasks are stored in memory by the backend and disappear when it restarts.

## Structure

```text
src/
  App.jsx                         Application shell
  App.css                         Shell layout
  index.css                       Global styles
  lib/http.js                     Fetch, response parsing, HTTP/network errors
  features/tasks/
    api/tasksApi.js                Task endpoint functions (no React)
    hooks/useTasks.js              Server data, requests, loading, errors, summary
    components/TaskForm.jsx        Reusable add/edit form and input state
    components/TaskList.jsx        Task collection and empty state
    components/TaskItem.jsx        Task display, editing, and actions
    components/TaskSummary.jsx     AI summary display and trigger
    TasksPage.jsx                  Connects state to the UI
    tasks.css                      Task-specific styles
```

Components never call `fetch` directly. Failed saves preserve form input;
successful changes invalidate the previous summary. Requests disable conflicting
actions, and initial loading failures offer a retry.

## Validation and deployment

```bash
npm run lint
npm test
npm run build
```

The automated tests use mocked HTTP responses to check the task endpoint
contract, JSON/text/empty responses, cancellation, and API/network errors.
Component rendering tests cover forms, disabled controls, empty/completed tasks,
safe title rendering, and summaries. They do not require a running backend or
call OpenAI.

To check the integration, add a task, edit its title, complete it, generate a
summary, and delete it. Stop the API to check the error message, then restart it
and retry loading.

The Vite development proxy is not included in the production build. Configure
your production web server or hosting platform to forward `/api` to the backend,
and serve the generated `dist/` directory. Do not treat `npm run preview` as a
production API gateway.
