document.addEventListener("DOMContentLoaded", function () {
    // 1. Logika Pemilihan Operator Manual
    const operatorSelect = document.getElementById("operatorSelect");
    const manualGroup = document.getElementById("manualOperatorGroup");
    const manualInput = document.getElementById("operatorManual");

    if (operatorSelect) {
        operatorSelect.addEventListener("change", function () {
            if (this.value === "MANUAL") {
                manualGroup.classList.remove("hidden");
                manualInput.setAttribute("required", "required");
            } else {
                manualGroup.classList.add("hidden");
                manualInput.removeAttribute("required");
                manualInput.value = "";
            }
        });
    }

    // 2. Logika Canvas Signature Pad (PIC)
    const canvas = document.getElementById("sig-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let drawing = false;

        // Atur ukuran canvas sesuai container penampungnya
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            ctx.scale(ratio, ratio);
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#002c5f";
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // Event handler mouse
        canvas.addEventListener("mousedown", (e) => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener("mousemove", (e) => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
        canvas.addEventListener("mouseup", () => drawing = false);
        canvas.addEventListener("mouseleave", () => drawing = false);

        // Event handler Sentuhan Layar HP (Touchscreen)
        canvas.addEventListener("touchstart", (e) => {
            drawing = true;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
            e.preventDefault();
        });
        canvas.addEventListener("touchmove", (e) => {
            if (!drawing) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
            e.preventDefault();
        });
        canvas.addEventListener("touchend", () => drawing = false);

        // Tombol Clear Canvas
        document.getElementById("clear-sig").addEventListener("click", function (e) {
            e.preventDefault();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        // Intersept submit form untuk konversi canvas ke data URI base64
        const mainForm = document.getElementById("bastkForm");
        mainForm.addEventListener("submit", function () {
            const dataUrl = canvas.toDataURL();
            document.getElementById("signature_data").value = dataUrl;
        });
    }
});