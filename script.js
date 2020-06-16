const clickOutsideNodeWatch = [];
let hasPopoverOpen = false;
let lastPosition = null;
const inputField = document.getElementById("input__field");
const previewCopyBtn = document.getElementById("preview__copy");
const previewContent = document.getElementById("preview__content");

// Update preview and add listner
previewContent.innerHTML = textMeshRichTextToHtml(inputField.value) || "...";
inputField.addEventListener("input", () => {
  previewContent.innerHTML = textMeshRichTextToHtml(inputField.value) || "...";
  previewCopyBtn.innerHTML = "Copy";
});

// Copy
previewCopyBtn.innerHTML = "Copy";
previewCopyBtn.addEventListener("click", () => {
  // Looks like LoR client doesn't accepte closing alpha
  const lorNamr = inputField.value.replace(/<\/alpha>/g, "<alpha=#FF>");
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

// Add simple Pickers
addPickerListener("picker__bold", "<b>", "</b>");
addPickerListener("picker__italic", "<i>", "</i>");
addPickerListener("picker__underscore", "<u>", "</u>");
addPickerListener("picker__strikeThrough", "<s>", "</s>");
addPickerListener("picker__superscript", "<sup>", "</sup>");
addPickerListener("picker__subscript", "<sub>", "</sub>");

// Color picker
// Simple example, see optional options for more configuration.
const pickr = Pickr.create({
  el: "#picker__color",
  useAsButton: true,
  lockOpacity: true,
  theme: "classic", // or 'monolith', or 'nano'
  swatches: [
    "rgb(244, 67, 54)",
    "rgb(233, 30, 99)",
    "rgb(156, 39, 176)",
    "rgb(103, 58, 183)",
    "rgb(63, 81, 181)",
    "rgb(33, 150, 243)",
    "rgb(3, 169, 244)",
    "rgb(0, 188, 212)",
    "rgb(0, 150, 136)",
    "rgb(76, 175, 80)",
    "rgb(139, 195, 74)",
    "rgb(205, 220, 57)",
    "rgb(255, 235, 59)",
    "rgb(255, 193, 7)",
  ],
  components: {
    // Main components
    preview: true,
    opacity: false,
    hue: true,
    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: false,
      save: true,
    },
  },
  i18n: {
    "btn:save": "Apply",
    "aria:btn:save": "apply and close",
  },
});
pickr.on("save", function () {
  const color = pickr.getColor().toHEXA().join("").toUpperCase();
  const openingTag = `<#${color}>`; // color= is optionnal, save charactere !
  const closingTag = ""; // to decrease charactere count, no closing tag
  const cursorPosition = getCursorPosition(inputField, true);
  inputField.value = wrapeTextSelectionWithTag(
    openingTag,
    closingTag,
    cursorPosition,
    inputField.value
  );
  inputField.dispatchEvent(new Event("input"));
  inputField.focus();
});

// Opacity popover
addPopover({
  triggerId: "picker__opacity",
  contentId: "picker__opacity__popover",
  onOpen: function () {
    document.getElementById("picker__opacity__range").value = 255;
  },
});
document
  .getElementById("picker__opacity__apply")
  .addEventListener("click", function () {
    // TextMesh use hexa for opacity
    const opacity = parseInt(
      document.getElementById("picker__opacity__range").value
    )
      .toString(16)
      .toUpperCase();
    const openingTag = `<alpha=#${opacity}>`;
    const closingTag = ""; // to decrease charactere count, no closing tag
    const cursorPosition = getCursorPosition(inputField, true);
    inputField.value = wrapeTextSelectionWithTag(
      openingTag,
      closingTag,
      cursorPosition,
      inputField.value
    );
    inputField.dispatchEvent(new Event("input"));
    inputField.focus();
    closeAllPopover();
  });

// Monospaceing popover
addPopover({
  triggerId: "picker__monoSpacing",
  contentId: "picker__monoSpacing__popover",
  onOpen: function () {
    document.getElementById("picker__monoSpacing__range").value = 0;
  },
});
document
  .getElementById("picker__monoSpacing__apply")
  .addEventListener("click", function () {
    const spacing = (
      parseInt(document.getElementById("picker__monoSpacing__range").value) /
      100
    ).toFixed(2);
    const openingTag = `<mspace=${spacing}em>`;
    const closingTag = "</mspace>";
    const cursorPosition = getCursorPosition(inputField, true);
    inputField.value = wrapeTextSelectionWithTag(
      openingTag,
      closingTag,
      cursorPosition,
      inputField.value
    );
    inputField.dispatchEvent(new Event("input"));
    inputField.focus();
    closeAllPopover();
  });

// Sprit popover
addPopover({
  triggerId: "picker__sprite",
  contentId: "picker__sprite__popover",
  onOpen: function () {},
});
const unrealsedRegionSpritId = [22, 23, 24, 25, 26, 38, 39, 40, 41, 42];
const picker__sprite__list = document.getElementById("picker__sprite__list");
for (let i = 0; i <= 46; i++) {
  let sprite = document.createElement("span");
  sprite.className = `sprite sprite-${i}`;
  if (unrealsedRegionSpritId.includes(i)) {
    sprite.className += ` sprite-newregion`;
  }
  sprite.addEventListener("click", function () {
    const cursorPosition = getCursorPosition(inputField);
    const tag = `<sprite=${i}>`;
    inputField.value = insertTagAtPosition(
      tag,
      cursorPosition.start || cursorPosition.position,
      inputField.value
    );
    inputField.dispatchEvent(new Event("input"));
    inputField.focus();
    closeAllPopover();
  });
  picker__sprite__list.appendChild(sprite);
}
const picker__sprite__enableSpoiler = document.getElementById(
  "picker__sprite__enableSpoiler"
);
picker__sprite__enableSpoiler.addEventListener("change", function () {
  document.querySelectorAll(".sprite-newregion").forEach((elem) => {
    elem.style.display = picker__sprite__enableSpoiler.checked
      ? "block"
      : "none";
  });
});

// utlis

/**
 * Returns:
 * - an object with {start, end} when there is a selected text
 * - an object with {position} otherwise. If the texte has not been focus, the position is at the start
 * @param elem The target element to get the cursor position from
 * @param forceSelection Force the position to select from the corsor to the end of the text
 */
function getCursorPosition(elem, forceSelection) {
  if (hasPopoverOpen) {
    // sometime, opening a popover loses focus on the textera and mess with the position
    return lastPosition;
  }

  const start = elem.selectionStart;
  const end = elem.selectionEnd;

  // Check if you've selected text
  if (start === end && !forceSelection) {
    if (start === elem.value.length) {
      return { position: 0 };
    } else {
      return { position: start };
    }
  } else {
    if (start !== end) {
      return { start, end };
    } else {
      return {
        start: start,
        end: (inputField.value || "").length,
      };
    }
  }
}

function wrapeTextSelectionWithTag(openTag, closeTag, selection, text) {
  return (
    text.substring(0, selection.start) +
    openTag +
    text.substring(selection.start, selection.end) +
    closeTag +
    text.substring(selection.end, text.length)
  );
}

function insertTagAtPosition(tag, position, text) {
  return (
    text.substring(0, position) + tag + text.substring(position, text.length)
  );
}

function addPickerListener(selector, openingTag, closingTag = null) {
  document.getElementById(selector).addEventListener("click", () => {
    if (closingTag) {
      const cursorPosition = getCursorPosition(inputField, true);
      inputField.value = wrapeTextSelectionWithTag(
        openingTag,
        closingTag,
        cursorPosition,
        inputField.value
      );
    } else {
      const cursorPosition = getCursorPosition(inputField);
      inputField.value = insertTagAtPosition(
        openingTag,
        cursorPosition.start || cursorPosition.position,
        inputField.value
      );
    }

    inputField.dispatchEvent(new Event("input"));
    inputField.focus();
  });
}

function textMeshRichTextToHtml(text) {
  // http://digitalnativestudios.com/textmeshpro/docs/rich-text/
  return (
    text
      // bold
      .replace(/<b>/g, '<span style="font-weight: bold">')
      .replace(/<\/b>/g, "</span>")
      // italic
      .replace(/<i>/g, '<span style="font-style: italic">')
      .replace(/<\/i>/g, "</span>")
      // strikethrough
      .replace(/<s>/g, '<span style="text-decoration: line-through">')
      .replace(/<\/s>/g, "</span>")
      // underline
      .replace(/<u>/g, '<span style="text-decoration: underline">')
      .replace(/<\/u>/g, "</span>")
      // super-script
      .replace(/<sup>/g, '<span style="vertical-align: super">')
      .replace(/<\/sup>/g, "</span>")
      // sub-script
      .replace(/<sub>/g, '<span style="vertical-align: sub">')
      .replace(/<\/sub>/g, "</span>")
      // color
      .replace(/<(#[A-Z0-9]{6})>/g, function (match, color) {
        return `<span style="color: ${color}">`;
      })
      .replace(/<\/color>/g, "</span>")
      // opacity
      .replace(/<alpha=#([A-Z0-9]{2})>/g, function (match, opacityHex) {
        const opacity = parseInt(opacityHex, 16) / 255;
        return `<span style="opacity: ${opacity}">`;
      })
      .replace(/<\/alpha>/g, "</span>")
      // monospacing
      .replace(/<mspace=([0-9\.]{1,}em)>/g, function (match, spacing) {
        return `<span style="letter-spacing: ${spacing}">`;
      })
      .replace(/<\/mspace>/g, "</span>")
      // sprite
      .replace(/<sprite=([0-9]+)>/g, function (match, spriteId) {
        return `<span class="sprite__container"><span class="sprite sprite-${spriteId}"></span></span>`;
      })
  );
}

function addPopover({ triggerId, contentId, onOpen }) {
  const trigger = document.getElementById(triggerId);
  const content = document.getElementById(contentId);
  clickOutsideNodeWatch.push(trigger);
  clickOutsideNodeWatch.push(content);
  trigger.addEventListener("click", openPopover(content, onOpen));
}
function openPopover(content, onOpen) {
  return function openPopoverListener() {
    closeAllPopover(inputField, true);
    lastPosition = getCursorPosition(inputField, true); // false because all
    hasPopoverOpen = true;
    content.style.display = "block";
    onOpen();
  };
}
function closeAllPopover() {
  if (hasPopoverOpen) {
    document.querySelectorAll(".popover").forEach(function (elem) {
      elem.style.display = "none";
    });
    hasPopoverOpen = false;
  }
}
document.addEventListener("click", function (event) {
  if (
    hasPopoverOpen &&
    event.target &&
    !clickOutsideNodeWatch.some((node) => node.contains(event.target))
  ) {
    closeAllPopover();
  }
});
