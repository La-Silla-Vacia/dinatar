const generate = () => {
  const url = document.getElementById("url");
  const sheet = document.getElementById("sheet");
  const withColors = document.getElementById("withColors");
  const filtersOptions = document.getElementById("filtersOptions");
  const getOnly = document.getElementById("getOnly");

  const id_from_url = url.value.split("/")[5];

  const code = document.getElementById("code");

  code.textContent = `
    <script
      src="${''}"
      data-identity="dinatar-script"
      data-id="${id_from_url}"
      data-name="${sheet.value}"
      data-withColors="${withColors.checked}"
      data-filtersOptions='${filtersOptions.value}'
      data-getOnly="${getOnly.value}"
    ></script>
  `;
};