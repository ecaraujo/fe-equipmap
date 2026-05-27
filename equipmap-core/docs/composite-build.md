# Gradle Composite Build

Use this flow when editing `equipmap-core` and a service at the same time.

1. Keep repositories side by side:

```text
C:\Fontes\fe-equipmap\equipmap-core
C:\Fontes\fe-equipmap\auth-service
```

2. Add the local core build in the service `settings.gradle.kts`:

```kotlin
includeBuild("../equipmap-core")
```

3. Keep the normal published dependency in the service `build.gradle.kts`:

```kotlin
implementation("br.com.equipmap:equipmap-core:0.1.0-SNAPSHOT")
```

4. Build the service normally:

```powershell
cd C:\Fontes\fe-equipmap\auth-service
gradle build
```

Gradle resolves `br.com.equipmap:equipmap-core` from the local checkout. No local Maven publish is needed.
