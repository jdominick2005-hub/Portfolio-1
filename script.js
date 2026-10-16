
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;

    // Theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    function setTheme(theme) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        root.setAttribute("data-theme", selectedTheme);
        themeIcon.textContent = selectedTheme === "dark" ? "☀" : "☾";
        themeToggle.setAttribute(
            "aria-label",
            selectedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        );

        try {
            localStorage.setItem("portfolio-theme", selectedTheme);
        } catch (error) {
            // The theme still works if browser storage is unavailable.
        }
    }

    try {
        const savedTheme = localStorage.getItem("portfolio-theme");
        if (savedTheme === "dark" || savedTheme === "light") {
            setTheme(savedTheme);
        }
    } catch (error) {
        setTheme("light");
    }

    themeToggle.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme");
        setTheme(currentTheme === "dark" ? "light" : "dark");
    });

    // Mobile navigation
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const navigationLinks = document.querySelectorAll(".nav-link");

    function closeMenu() {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.textContent = isOpen ? "×" : "☰";
    });

    navigationLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // Highlight the active navigation section
    const sections = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        navigationLinks.forEach((link) => {
                            const isActive =
                                link.getAttribute("href") === `#${entry.target.id}`;

                            link.classList.toggle("active", isActive);
                        });
                    }
                });
            },
            {
                rootMargin: "-25% 0px -60% 0px",
                threshold: 0
            }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }

    // Scroll reveal animations
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("visible"));
    }

    // Copy email button
    const copyEmailButton = document.getElementById("copy-email");
    const copyStatus = document.getElementById("copy-status");

    copyEmailButton.addEventListener("click", async () => {
        const email = copyEmailButton.dataset.email;

        try {
            await navigator.clipboard.writeText(email);
            copyStatus.textContent = "Email copied to clipboard: " + email;
        } catch (error) {
            copyStatus.textContent = "Your email address is: " + email;
        }
    });

    // Portfolio chatbot
    const chatLauncher = document.getElementById("chat-launcher");
    const chatPanel = document.getElementById("chat-panel");
    const chatClose = document.getElementById("chat-close");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    const chatSuggestions = document.querySelectorAll("[data-chat]");

    const sectionAliases = {
        home: ["home", "homepage", "start", "main page", "top"],
        about: ["about", "about me", "who are you", "who is john", "your background", "introduction"],
        skills: ["skill", "skills", "technology", "technologies", "what can you do", "your abilities", "programming"],
        projects: ["project", "projects", "portfolio work", "your work", "attendance system", "navigazoo", "chatbot"],
        education: ["education", "school", "college", "academic", "career goal", "career goals"],
        contact: ["contact", "email", "reach you", "get in touch", "hire you", "connect"]
    };

    function openChat() {
        chatPanel.hidden = false;
        chatLauncher.setAttribute("aria-expanded", "true");
        chatInput.focus();
    }

    function closeChat() {
        chatPanel.hidden = true;
        chatLauncher.setAttribute("aria-expanded", "false");
        chatLauncher.focus();
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement("div");

        messageElement.className =
            "chat-message " + (sender === "user" ? "user-message" : "bot-message");

        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function goToSection(sectionId) {
        const section = document.getElementById(sectionId);

        if (!section) {
            return false;
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        navigationLinks.forEach((link) => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + sectionId
            );
        });

        closeMenu();
        return true;
    }

    function findRequestedSection(message) {
        const normalized = message
            .toLowerCase()
            .replace(/[’']/g, "")
            .replace(/[?!.,]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Handle requests such as "go to my skills" or "show me projects".
        for (const [sectionId, aliases] of Object.entries(sectionAliases)) {
            for (const alias of aliases) {
                const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const aliasPattern = new RegExp(
                    "(^|\\b)" + escapedAlias + "(\\b|$)",
                    "i"
                );

                if (aliasPattern.test(normalized)) {
                    return sectionId;
                }
            }
        }

        return null;
    }

    function getBotResponse(message) {
        const normalized = message.toLowerCase().trim();

        if (
            /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)
        ) {
            return {
                text: "Hello! Welcome to my portfolio. You can ask about my skills, projects, education, or contact details. You can also tell me which section to open.",
                section: null
            };
        }

        if (
            /\b(thank you|thanks|thx)\b/.test(normalized)
        ) {
            return {
                text: "You're welcome! Feel free to explore the rest of my portfolio.",
                section: null
            };
        }

        if (
            normalized.includes("attendance") &&
            (normalized.includes("project") || normalized.includes("system"))
        ) {
            return {
                text: "The Attendance Management System is an academic project concept for managing student attendance and records. Its technologies include C#, Windows Forms, and SQL Server. I'll take you to the Projects section.",
                section: "projects"
            };
        }

        if (normalized.includes("navigazoo")) {
            return {
                text: "NavigaZoo is an augmented-reality-based navigation concept for the Manila Zoological and Botanical Garden. It focuses on helping visitors navigate the zoo. I'll open the Projects section.",
                section: "projects"
            };
        }

        if (
            normalized.includes("machine learning") ||
            normalized.includes("trained model") ||
            normalized.includes("artificial intelligence")
        ) {
            return {
                text: "I'm exploring machine learning and chatbot development. This version of the portfolio assistant uses JavaScript rules and keyword matching. It does not use a trained ML model yet.",
                section: "skills"
            };
        }

        if (
            normalized.includes("cybersecurity") ||
            normalized.includes("cyber security") ||
            normalized.includes("networking")
        ) {
            return {
                text: "I'm interested in networking and cybersecurity. My learning path includes TCP/IP, subnetting, Linux, troubleshooting, and security fundamentals. You can find my current learning areas in the Skills section.",
                section: "skills"
            };
        }

        if (
            normalized.includes("resume") ||
            normalized.includes("cv")
        ) {
            return {
                text: "You can find the resume link in the About section. Make sure you add your PDF file to the files folder and use the correct filename.",
                section: "about"
            };
        }

        if (
            normalized.includes("who are you") ||
            normalized.includes("your name") ||
            normalized.includes("about john") ||
            normalized.includes("about dominick")
        ) {
            return {
                text: "I'm the portfolio assistant for John Dominick M. Gopez, an Information Technology student interested in software development, networking, cybersecurity, and machine learning.",
                section: "about"
            };
        }

        const requestedSection = findRequestedSection(normalized);

        if (requestedSection) {
            const sectionNames = {
                home: "Home",
                about: "About Me",
                skills: "Skills",
                projects: "Projects",
                education: "Education",
                contact: "Contact"
            };

            return {
                text: "Sure! I'll take you to the " + sectionNames[requestedSection] + " section.",
                section: requestedSection
            };
        }

        return {
            text: "I can help you navigate the portfolio. Try asking \"show me your skills,\" \"go to projects,\" \"tell me about yourself,\" or \"take me to contact.\"",
            section: null
        };
    }

    function handleChatMessage(message) {
        const cleanMessage = message.trim();

        if (!cleanMessage) {
            return;
        }

        addMessage(cleanMessage, "user");

        const response = getBotResponse(cleanMessage);
        addMessage(response.text, "bot");

        if (response.section) {
            window.setTimeout(() => {
                goToSection(response.section);
            }, 350);
        }
    }

    chatLauncher.addEventListener("click", () => {
        if (chatPanel.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    chatClose.addEventListener("click", closeChat);

    chatForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const message = chatInput.value;
        chatInput.value = "";
        handleChatMessage(message);
    });

    chatSuggestions.forEach((button) => {
        button.addEventListener("click", () => {
            const message = button.dataset.chat;

            if (button.classList.contains("project-link")) {
                openChat();
            }

            handleChatMessage(message);
        });
    });

    // Open the chatbot from project links
    document.querySelectorAll(".project-link[data-chat]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            openChat();
            handleChatMessage(link.dataset.chat);
        });
    });
});
