# **Full-Stack Testing Architecture Documentation**

This document outlines the testing strategies, technology stacks, and structural patterns used to ensure the reliability and integrity of the Time Tracking System (LW2). The architecture is divided into two distinct environments: the Spring Boot Backend and the Next.js Frontend.

## **1\. Backend Testing Architecture (Java / Spring Boot)**

The backend utilizes a strict, three-layer testing hierarchy isolating the web layer, business logic, and database layer.

### **1.1 Technology Stack**

| Technology | Purpose |
| :---- | :---- |
| **JUnit 5** | The core testing framework and execution engine. |
| **Mockito** | Simulation engine used to mock services and isolate business logic without needing a database. |
| **Spring Boot Test (MockMvc)** | Simulates incoming HTTP requests to test API endpoints and routing without starting a real web server. |
| **Testcontainers (Docker)** | Spins up temporary, disposable PostgreSQL database instances for safe database testing. |

### **1.2 Directory Structure & Scope**

Backend tests are strictly separated from production code, residing in the src/test/java/... parallel directory.

* **service/ (Unit Tests):** Tests the "Brain" of the application.  
  * *Files:* TaskServiceTest, ProjectServiceTest, UserServiceTest, AuthServiceTest, JwtServiceTest.  
  * *Scope:* Uses Mockito to bypass the database entirely. Proves that core Java logic, calculations, password hashing, and JWT token generation work correctly under various conditions.  
* **controller/ (Web Integration Tests):** Tests the "Doors" of the application.  
  * *Files:* TaskControllerTest, ProjectControllerTest, UserControllerTest, AuthControllerTest.  
  * *Scope:* Uses MockMvc. Mocks the service layer but tests the HTTP layer. Proves endpoints route correctly, handle JSON serialization, and return proper HTTP status codes (200 OK, 400 Bad Request, 401 Unauthorized).  
* **repository/ (Database Integration Tests):** Tests the "Vault" of the application.  
  * *Files:* RepositoryTest.  
  * *Scope:* Uses Testcontainers. Executes raw SQL against a real, temporary PostgreSQL database to ensure custom JPA queries save and retrieve exact records accurately.

## **2\. Frontend Testing Architecture (Next.js / React)**

The frontend utilizes a modern, component-driven testing strategy aimed at simulating real-world user interactions and data flow.

### **2.1 Technology Stack**

| Technology | Purpose |
| :---- | :---- |
| **Vitest** | A lightning-fast, Vite-native test runner optimized for modern React setups. |
| **React Testing Library (RTL)** | A toolkit that tests UI components by simulating human interactions (typing, clicking, finding elements by text). |
| **jsdom** | A lightweight "virtual browser" that runs inside the terminal, faking the DOM, HTML forms, and localStorage. |
| **jest-dom** | Extends Vitest with DOM-specific assertions (e.g., toBeInTheDocument()). |

### **2.2 Directory Structure & Scope**

The frontend uses the **Colocation** strategy: test files live in the exact same directory as the files they are testing (e.g., use-tasks.test.ts lives next to use-tasks.ts).

* **lib/ (Network & Utilities):**  
  * *Files:* api.test.ts, utils.test.ts.  
  * *Scope:* Pure logic tests. Proves that Tailwind CSS classes merge correctly and that the apiFetch wrapper successfully grabs JWT tokens from localStorage and formats outgoing HTTP requests.  
* **hooks/ (Data & State):**  
  * *Files:* use-projects.test.ts, use-tasks.test.ts, use-users.test.ts, use-mobile.test.ts, use-toast.test.ts.  
  * *Scope:* Mocks the API layer. Verifies that data slices handle loading states properly, update arrays correctly on mutations, and accurately respond to environmental changes (like resizing the virtual window).  
* **components/ (User Interface):**  
  * *Files:* login-page.test.tsx, time-tracking-layout.test.tsx.  
  * *Scope:* Uses the virtual browser to render HTML. Simulates typing and clicking to verify form validations, API dispatching, and dynamic layout rendering based on user roles.  
* **app/ (Integration & Routing):**  
  * *Files:* page.test.tsx.  
  * *Scope:* Tests the application's gatekeeper logic. Proves that users without a token are forced to the login screen, while authenticated users are successfully routed directly to the dashboard.