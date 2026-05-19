document.addEventListener("DOMContentLoaded", function() {
    const formPic = document.getElementById('formPic');
    if (formPic) {
        formPic.addEventListener('input', function() {
            document.getElementById('labelPic').innerText = this.value || '-';
        });
    }

    const canvas = document.getElementById('sigPad');
    if (canvas) {
        const signaturePad = new SignaturePad(canvas);
        document.getElementById('clearSig').addEventListener('click', () => signaturePad.clear());
function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    const oldData = signaturePad.toData(); 
    
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    
    signaturePad.fromData(oldData); 
}
window.addEventListener("orientationchange", resizeCanvas); 
resizeCanvas();

        document.getElementById('bastkForm').addEventListener('submit', function(e) {
            if (signaturePad.isEmpty()) {
                alert("Peringatan: Tanda Tangan PIC wajib diisi terlebih dahulu!");
                e.preventDefault();
                return;
            }
            document.getElementById('ttdBase64').value = signaturePad.toDataURL();
        });
    }

    const inputFoto = document.getElementById('inputFoto');
    const hiddenPhotosContainer = document.getElementById('hiddenPhotosContainer');

    if (inputFoto) {
        inputFoto.addEventListener('change', function() {
            hiddenPhotosContainer.innerHTML = '';
            const files = this.files;

            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'foto_base64[]';
                    input.value = event.target.result;
                    hiddenPhotosContainer.appendChild(input);
                };
                reader.readAsDataURL(files[i]);
            }
        });
    }
});