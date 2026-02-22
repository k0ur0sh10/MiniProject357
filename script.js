(function () {
    const root = document.documentElement;
    const themeBtn = document.getElementById("toggleTheme");
    const pdfBtn = document.getElementById("pdfBtn");

    // Load theme
    const saved = localStorage.getItem("hc_theme");
    if (saved === "light" || saved === "dark") root.dataset.theme = saved;
    else root.dataset.theme = "dark";

    function setTheme(next) {
        root.dataset.theme = next;
        localStorage.setItem("hc_theme", next);
        if (themeBtn) themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = root.dataset.theme || "dark";
            setTheme(current === "dark" ? "light" : "dark");
        });
        themeBtn.setAttribute("aria-pressed", root.dataset.theme === "dark" ? "true" : "false");
    }

    // ✅ PDF download button (fetch from root: /report.pdf)
    async function downloadPdf() {
        const fileUrl = "report.pdf";
        const downloadName = "report.pdf";

        try {
            if (pdfBtn) {
                pdfBtn.disabled = true;
                pdfBtn.classList.add("is-loading");
            }

            const res = await fetch(fileUrl, { cache: "no-store" });
            if (!res.ok) throw new Error(`Could not fetch ${fileUrl} (HTTP ${res.status})`);

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Could not download the PDF. Make sure 'report.pdf' is in the same folder as index.html.");
        } finally {
            if (pdfBtn) {
                pdfBtn.disabled = false;
                pdfBtn.classList.remove("is-loading");
            }
        }
    }

    if (pdfBtn) {
        pdfBtn.addEventListener("click", downloadPdf);
    }

    // Active section highlighting in TOC
    const links = Array.from(document.querySelectorAll(".toc__nav a"));
    const sections = links
        .map(a => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);

    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;
            const id = "#" + visible.target.id;

            links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: [0.05, 0.2, 0.5] }
    );

    sections.forEach(s => observer.observe(s));

    // Image modal
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    const modalCaption = document.getElementById("modalCaption");

    function openModal(img, captionText) {
        if (!modal || !modalImg || !modalCaption) return;
        modalImg.src = img.src;
        modalImg.alt = img.alt || "Preview";
        modalCaption.textContent = captionText || "";
        modal.setAttribute("aria-hidden", "false");
        // ✅ Do NOT lock scrolling — user can scroll within the modal panel
    }

    function closeModal() {
        if (!modal) return;
        modal.setAttribute("aria-hidden", "true");
        if (modalImg) modalImg.src = "";
        if (modalCaption) modalCaption.textContent = "";
    }

    document.addEventListener("click", (e) => {
        const target = e.target;

        // Close
        if (target && target.dataset && target.dataset.close === "true") closeModal();

        // Open from any container with data-modal="true"
        const fig = target && target.closest ? target.closest('[data-modal="true"]') : null;
        if (!fig) return;

        const img = fig.querySelector("img");
        const cap = fig.querySelector("figcaption");
        if (!img || !img.src) return;

        // Ignore missing images that were hidden
        if (img.style.display === "none") return;

        openModal(img, cap ? cap.textContent : "");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
})();