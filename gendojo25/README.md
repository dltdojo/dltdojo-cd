# GenDoJo 2025 生成式道場

GenDoJo, a generative dojo, is an open-source project that leverages generative AI (GenAI) tools to generate a large number of practice dojos for learners. These dojos enable learners to quickly build the necessary practice environment for learning specific software development skills, eliminating the need to spend time searching through documentation and installing various versions before they can start practicing.

生成式道場 GenDoJo 是一個開放原始碼專案，專案使用生成式人工智慧 GenAI 工具大量的生成可以供學習者快速的建立學習特定軟體開發所需要的練習道場，不必花費時間去查文件並安裝各種版本才能開始練習。

## Docker is all you need in GenDoJo

Using Docker and Docker Compose for development and testing of GenDoJo offers several advantages over installing software directly on the host machine, particularly when it comes to avoiding "chaos problems":

1. Isolation: Docker containers provide isolated environments for applications, ensuring that dependencies and configurations don't interfere with other software on the host system. This reduces conflicts between different projects or versions of software.

2. Consistency: Docker enables you to define a consistent environment across different development machines and deployment targets. This "it works on my machine" problem is largely eliminated.

3. Version control of environments: Docker images and Compose files can be version-controlled alongside your code, allowing you to track changes in your development environment over time.

4. Easy cleanup: When you're done with a project, you can simply remove the containers and images without leaving residual files or configurations on your host system.

5. Reproducibility: Anyone can recreate the exact same environment by using the Dockerfile and docker-compose.yml, making it easier for team members to collaborate and for new developers to onboard.

6. Simpler dependency management: All required dependencies are specified in the Dockerfile, eliminating the need to manually install and manage them on the host system.

7. Multiple versions: You can run different versions of the same software simultaneously in separate containers, which is often difficult when installing directly on the host.

8. Mimicking production: Docker allows you to create environments that closely resemble your production setup, reducing discrepancies between development and production environments.

9. Resource management: Docker allows for better control over resource allocation to different services, preventing one application from consuming all available resources on the host.

10. Quick start and reset: With Docker, you can quickly start a clean environment or reset to a known state, which is valuable for testing and debugging.

These factors combine to create a more stable, predictable, and manageable development environment, reducing the "chaos" that can arise from conflicting dependencies, inconsistent environments, or lingering configurations from past projects on the host system.

以下是使用Docker和Docker Compose進行開發和測試相比直接在主機上安裝軟體的優勢，特別是在避免"混亂問題"方面：

1. 隔離性：Docker容器為應用程序提供隔離的環境，確保依賴項和配置不會干擾主機系統上的其他軟體。這減少了不同項目或軟體版本之間的衝突。

2. 一致性：Docker能夠在不同的開發機器和部署目標上定義一致的環境。這基本上消除了"在我的機器上可以運行"的問題。

3. 環境版本控制：Docker鏡像和Compose文件可以與你的代碼一起進行版本控制，允許你隨時間追踪開發環境的變化。

4. 輕鬆清理：當你完成一個項目時，你可以簡單地移除容器和鏡像，而不會在主機系統上留下殘餘文件或配置。

5. 可重現性：任何人都可以通過使用Dockerfile和docker-compose.yml重現完全相同的環境，使團隊成員更容易協作，新開發人員更容易入門。

6. 簡化依賴管理：所有必需的依賴項都在Dockerfile中指定，消除了在主機系統上手動安裝和管理它們的需要。

7. 多版本支持：你可以在單獨的容器中同時運行同一軟體的不同版本，這在直接安裝在主機上時通常是困難的。

8. 模擬生產環境：Docker允許你創建與生產設置非常相似的環境，減少開發和生產環境之間的差異。

9. 資源管理：Docker允許更好地控制不同服務的資源分配，防止一個應用程序消耗主機上的所有可用資源。

10. 快速啟動和重置：使用Docker，你可以快速啟動一個乾淨的環境或重置到已知狀態，這對測試和調試很有價值。

這些因素結合起來創建了一個更穩定、可預測和易於管理的開發環境，減少了由於衝突的依賴項、不一致的環境或主機系統上過去項目遺留的配置而可能產生的"混亂"。