const inputField = document.getElementById("input__field");
const previewCopyBtn = document.getElementById("preview__copy");
const previewContent = document.getElementById("preview__content");

inputField.addEventListener("input", () => {
  previewContent.innerHTML = inputField.value || "...";
  previewCopyBtn.innerHTML = "Copy";
});

previewCopyBtn.innerHTML = "Copy";
previewCopyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(inputField.value).then(
    function () {
      previewCopyBtn.innerHTML = "Copied !";
    },
    function (err) {
      previewCopyBtn.innerHTML = "Error !";
      console.error(err);
    }
  );
});
