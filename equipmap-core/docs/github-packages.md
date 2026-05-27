# GitHub Packages Publishing

`equipmap-core` publishes to:

```text
https://maven.pkg.github.com/equipmap/equipmap-core
```

Required credentials:

- `GITHUB_ACTOR`: GitHub username or CI actor
- `GITHUB_TOKEN`: token with `write:packages`

Publish a release:

```powershell
cd C:\Fontes\fe-equipmap\equipmap-core
gradle publish -Pversion=0.1.0
```

Consume from a service:

```kotlin
repositories {
    maven {
        name = "GitHubPackages"
        url = uri("https://maven.pkg.github.com/equipmap/equipmap-core")
        credentials {
            username = providers.gradleProperty("gpr.user")
                .orElse(providers.environmentVariable("GITHUB_ACTOR"))
                .orNull
            password = providers.gradleProperty("gpr.key")
                .orElse(providers.environmentVariable("GITHUB_TOKEN"))
                .orNull
        }
    }
}

dependencies {
    implementation("br.com.equipmap:equipmap-core:0.1.0")
}
```
