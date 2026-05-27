# equipmap-core

Shared Java library for EquipMap services.

This module is intentionally small. It contains only:

- RabbitMQ event DTOs
- Infrastructure interfaces such as `StorageService` and `MessagingProvider`
- RFC 7807-style error response contracts
- Shared constants for queues, routing keys, headers, and storage limits

Business rules and concrete implementations belong in each service.

## Requirements

- Java 21
- Gradle 8+

## Local Build

```powershell
cd C:\Fontes\fe-equipmap\equipmap-core
gradle build
```

If using a Gradle wrapper in CI or after generating one locally:

```powershell
.\gradlew.bat build
```

## Gradle Composite Build

During local development, dependent services should include this project without publishing it.

In the service `settings.gradle.kts`:

```kotlin
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
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
}

includeBuild("../equipmap-core")
```

In the service `build.gradle.kts`:

```kotlin
dependencies {
    implementation("br.com.equipmap:equipmap-core:0.1.0-SNAPSHOT")
}
```

With `includeBuild("../equipmap-core")`, Gradle substitutes the published dependency with the local project.

## Publishing to GitHub Packages

Set credentials with environment variables:

```powershell
$env:GITHUB_ACTOR = "<github-user>"
$env:GITHUB_TOKEN = "<github-token-with-packages-write>"
gradle publish
```

Or use Gradle properties:

```properties
gpr.user=<github-user>
gpr.key=<github-token-with-packages-write>
```

The Maven coordinate is:

```text
br.com.equipmap:equipmap-core:<version>
```

Version can be overridden at publish time:

```powershell
gradle publish -Pversion=0.1.0
```
