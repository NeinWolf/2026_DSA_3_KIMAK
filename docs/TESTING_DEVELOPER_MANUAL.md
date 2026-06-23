# **Testing User Manual & Developer Guide**

This guide provides practical instructions for running, writing, and maintaining tests across the LW2 Time Tracking System.

## **1\. Backend Testing Guide (Java / Spring Boot)**

### **Prerequisites**

* Java Development Kit (JDK) installed.  
* **Docker Desktop** must be running in the background (required for Testcontainers in the Repository tests).

### **Running the Tests**

You can run the tests via your IDE (IntelliJ) or the command line using the Gradle wrapper.

**Option A: Command Line (Recommended for full suites)**

Open your terminal in the backend root directory and run:

\# Run all tests  
./gradlew test

**Option B: IntelliJ IDEA**

1. Navigate to the src/test/java directory in your project tree.  
2. Right-click on the controller, service, or repository folder.  
3. Select **Run 'Tests in...'** (or click the green play arrows next to the class definitions).

### **Writing a New Backend Test**

Backend tests follow the **Parallel Package** rule.

1. If you create a new class at src/main/java/.../service/ReportService.java.  
2. You MUST create its test at exactly src/test/java/.../service/ReportServiceTest.java.  
3. Annotate the test class with @ExtendWith(MockitoExtension.class) for unit tests or @WebMvcTest for controller tests.

## **2\. Frontend Testing Guide (Next.js / React)**

### **Prerequisites**

* Node.js installed.  
* Dependencies installed via pnpm install.

### **Running the Tests**

Vitest comes with a highly optimized "Watch Mode" that automatically re-runs tests the moment you save a file.

Open your terminal in the frontend root directory and run:

\# Start the test runner in interactive Watch Mode  
pnpm test

**Interactive Vitest Controls:**

While the runner is active in the terminal, you can press:

* a: Re-run all tests.  
* f: Run only failed tests.  
* q: Quit the test runner.  
* Enter: Trigger a manual re-run.

### **Writing a New Frontend Test**

Frontend tests follow the **Colocation** rule.

1. If you create a new file: components/ui/button.tsx.  
2. Create your test right next to it: components/ui/button.test.tsx.  
3. Vitest will automatically discover the new file and run it without requiring any configuration changes.

**Bypassing HTML5 Validations in UI Tests:**

When testing forms that use native HTML required attributes, fireEvent.click() will be blocked by jsdom. To test your custom JavaScript validation, bypass the click and trigger the form directly:

const form \= screen.getByPlaceholderText('Username').closest('form');  
fireEvent.submit(form\!);

