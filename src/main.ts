import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <main class="title">
    <h1>The Last Scholar of Golb</h1>
    <p>Everyone else is gone. The books remain.</p>
    <button id="start">Begin</button>
  </main>
`;
