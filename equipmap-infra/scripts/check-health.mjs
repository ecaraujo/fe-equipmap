const urls = [
  "http://localhost:4000/health",
  "http://localhost:8081/actuator/health",
  "http://localhost:8082/actuator/health",
  "http://localhost:8083/actuator/health",
  "http://localhost:8084/actuator/health",
  "http://localhost:8085/actuator/health",
  "http://localhost:8086/actuator/health",
  "http://localhost:8087/actuator/health",
  "http://localhost:8088/actuator/health",
];

const results = await Promise.all(urls.map(async (url) => {
  try {
    const response = await fetch(url);
    const body = await response.text();
    return { url, ok: response.ok, body };
  } catch (error) {
    return { url, ok: false, body: error.message };
  }
}));

for (const result of results) {
  console.log(`${result.ok ? "OK" : "FAIL"} ${result.url}`);
  if (!result.ok) console.log(result.body);
}

if (results.some((result) => !result.ok)) process.exit(1);
