plugins {
    `java-library`
    `maven-publish`
}

group = "br.com.equipmap"
version = providers.gradleProperty("version").orElse("0.1.0-SNAPSHOT").get()

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }

    withJavadocJar()
    withSourcesJar()
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.release.set(21)
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])

            pom {
                name.set("equipmap-core")
                description.set("Shared DTOs, interfaces, constants, and error contracts for EquipMap services.")
                url.set("https://github.com/equipmap/equipmap-core")

                licenses {
                    license {
                        name.set("MIT")
                    }
                }

                scm {
                    connection.set("scm:git:https://github.com/equipmap/equipmap-core.git")
                    developerConnection.set("scm:git:ssh://git@github.com/equipmap/equipmap-core.git")
                    url.set("https://github.com/equipmap/equipmap-core")
                }
            }
        }
    }

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
}
