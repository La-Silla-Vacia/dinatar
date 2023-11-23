var link = document.createElement("link");
link.href = "/v3/styles.css";
// link.type = "text/css";
link.rel = "stylesheet";
link.media = "screen,print";

document.getElementsByTagName("head")[0].appendChild(link);

// MODAL SETUP
var _targettedModal,
  _triggers = document.querySelectorAll("[data-modal-trigger]"),
  _dismiss = document.querySelectorAll("[data-modal-dismiss]"),
  modalActiveClass = "is-modal-active";

function showModal(el, id) {
  _targettedModal = document.querySelector('[data-modal-name="' + el + '"]');
  _targettedModal.classList.add(modalActiveClass);
  const finder = data.find((item) => item.id == id);
  updateModal(finder);
}

function hideModal(event) {
  if (event === undefined || event.target.hasAttribute("data-modal-dismiss")) {
    _targettedModal.classList.remove(modalActiveClass);
  }
}

function bindEvents(el, callback) {
  for (let i = 0; i < el.length; i++) {
    (function (i) {
      el[i].addEventListener("click", function (event) {
        callback(this, event);
      });
    })(i);
  }
}

function triggerModal() {
  bindEvents(_triggers, function (that) {
    showModal(that.dataset.modalTrigger, that.dataset.modalProfileId);
  });
}

function dismissModal() {
  bindEvents(_dismiss, function (that) {
    hideModal(event);
  });
}

function initModal() {
  _triggers = document.querySelectorAll("[data-modal-trigger]"),
  _dismiss = document.querySelectorAll("[data-modal-dismiss]"),
  modalActiveClass = "is-modal-active";
  triggerModal();
  dismissModal();
}

// ---------------------------------------------------------------------------------------------------------------------------- //
let data;
let filters;
let colors;
const $ = jQuery;

const parseData = (data_to_parsed, only) => {
  var keys = data_to_parsed.shift();
  const get_only = only.split(",").map((item) => item.split(":"));

  var jsonArray = data_to_parsed.map(function (values, i) {
    const row = keys.reduce(function (object, key, index) {
      object[key.trim()] = values[index];
      return object;
    }, {});

    return {
      id: i,
      ...row,
    };
  });

  return jsonArray.filter((item) => {
    let valid = true;
    get_only.forEach((element) => {
      if (item[element[0]] != element[1]) {
        valid = false;
      }
    });
    return valid;
  });
};

const parseColors = (data) => {
  try {
    let final = {};
    data.values.forEach((item) => {
      final[item[0]] = item[1];
    });
    return final;
  } catch (error) {
    console.log(error);
  }
};

const fetchColors = async (id) => {
  const res_colors = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Colors?key=AIzaSyD476egRKXU8tY8HD2z55SuXYdjCplBENI`
  );
  // const res_colors = await fetch(`https://dinatar.gabbler.io/colors/${id}`)

  const data = await res_colors.json();

  return parseColors(data);
};

const fetchData = async (id, name, only) => {
  const res_data = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${name}?key=AIzaSyD476egRKXU8tY8HD2z55SuXYdjCplBENI`
  );

  // const res_data = await fetch(`https://dinatar.gabbler.io/sheets/${name}/${id}`)

  return parseData((await res_data.json()).values, only);
};

const parsedFilters = (filters, data_for_filters) => {
  let newsFilters = {};
  filters.forEach((item) => {
    let options = ["Todos"];
    data_for_filters?.forEach((element) => {
      if (!options.includes(element[item]) && element[item] != "") {
        options.push(element[item]);
      }
    });

    newsFilters[item.trim()] = {
      value: "Todos",
      options: options,
    };
  });

  return newsFilters;
};

const updateProfiles = () => {
  const profiles = data.filter((item) => {
    let valid = true;
    Object.keys(filters).forEach((element) => {
      if (filters[element].value != "Todos") {
        if (item[element] != filters[element].value) {
          valid = false;
        }
      }
    });
    return valid;
  });

  createProfiles(profiles, colors);
};

const createFilters = (filters_params, data) => {
  Object.keys(filters_params).forEach((item) => {
    let container = $('<div class="dinatar-filter-item"></div>');
    let label = $(
      `<label class="dinatar-filter-label" for="${item}">${item}</label>`
    );
    let select = $(
      `<select  class="select-dinatar" data-name="${item}" id="${item}"></select>`
    );
    filters_params[item].options.forEach((option) => {
      let opt = $(`<option value="${option}">${option}</option>`);
      select.append(opt);
    });

    select.on("change", function () {
      filters[item].value = $(this).val();
      updateProfiles();
    });

    container.append(label);
    container.append(select);
    $(".dinatar-filters").append(container);
  });
};

const updateModal = (data) => {
  const subtitle_1 = data["Cargo que busca"];
  const subtitle_2 = data["Territorio"];
  const subtitle_3 = data["Coavales"];

  $(`[data-modal-name="dinatar-modal-profile"] .dinatar-modal__image`).attr(
    "src",
    data["Foto"]
  );

  $(`[data-modal-name="dinatar-modal-profile"] .another-info`).html(`
    <h3 class="dinatar-modal__title">${data["Nombres"]} ${data["Apellido 1"]} ${
    data["Apellido 2"]
  }</h3>
    ${subtitle_1.length ? `<span>${subtitle_1}</span>` : ""}
    ${subtitle_2.length ? `<span>${subtitle_2}</span>` : ""}
    ${
      subtitle_3.length
        ? `<span><strong>Coavales: </strong> ${subtitle_3}</span>`
        : ""
    }
  `);

  $(`[data-modal-name="dinatar-modal-profile"] .dinatar-modal__content`).html(`
    <p>${data["Perfil"]}</p>
  `);
};

const createModal = () => {
  const container = $("body");

  container.append(`
    <div
      class="dinatar-modal"
      data-modal-name="dinatar-modal-profile"
      data-modal-dismiss
    >
      <div class="dinatar-modal__dialog">
        <button class="dinatar-modal__close" data-modal-dismiss>×</button>
        <header class="dinatar-modal__header">
          <img
            class="dinatar-modal__image"
            src=""
            alt=""
            srcset=""
          />
          <div class="another-info"></div>
        </header>
        <div class="dinatar-modal__content">
          <p class="profile-description"></p>
        </div>
        <footer class="dinatar-modal__footer">
          <button data-modal-dismiss class="dinatar-modal-close-btn">Cerrar</button>
        </footer>
      </div>
    </div>
  `);
};

const createProfiles = (data, colors) => {
  $("#dinatar-container-profiles").html("");

  data.forEach((item, i) => {
    const completeName = `${item["Nombres"]} ${item["Apellido 1"]} ${item["Apellido 2"]}`;
    const cargo_que_busca = item["Cargo que busca"];
    const partido = item.Partido;
    const modal_id = `dinatar-modal-profile`;

    const color = colors[item["Partido"]] || "rgb(159, 155, 145)";

    let container = $(
      `<div class="dinatar-profile" data-modal-trigger="${modal_id}" data-modal-profile-id="${item.id}"></div>`
    );
    let content = $(`<div class="profile-content"></div>`);
    let footer = $(
      `<div class="dinatar-profile-footer" style="background-color:${color}"></div>`
    );
    let image = $(`<img src="${item["Foto"]}" alt="${completeName}">`);
    let name = $(`<h3 class="dinatar-profile-name">${completeName}</h3>`);
    let footer_item_one = $(
      `<span class="profile-footer__item__one">${cargo_que_busca}</span>`
    );
    let footer_item_two = $(
      `<span class="profile-footer__item__two">${partido}</span>`
    );

    content.append(image);
    content.append(name);
    container.append(content);

    if (cargo_que_busca || partido) {
      footer.append(footer_item_one);
      footer.append(footer_item_two);
      container.append(footer);
    }

    $("#dinatar-container-profiles").append(container);
    // createModal(modal_id, item);
  });

  initModal();
};

$(async function () {
  if (!$("#dinatar").length) {
    throw new Error(
      "Dinatar container not found, please add #dinatar to your HTML: <div id='dinatar'></div>"
    );
  }

  const init = document.querySelector('script[data-identity="dinatar-script"]');
  const id = init.dataset.id;
  const name = init.dataset.name;
  const with_colors = init.dataset.withcolors;
  let filter_options = init.dataset.filtersoptions;
  const get_only = init.dataset.getonly;

  if (!id) {
    throw new Error(
      "Dinatar script tag is missing the data-id attribute, please add it."
    );
  }

  if (!name) {
    throw new Error(
      "Dinatar script tag is missing the data-name attribute, please add it."
    );
  }

  if (!with_colors) {
    throw new Error(
      "Dinatar script tag is missing the data-withcolors attribute, please add it."
    );
  }

  if (filter_options) {
    filter_options = JSON.parse(filter_options);
  }

  // INIT CONTAINERS
  const dinatar = $("#dinatar");
  const containerFilters = $('<div class="dinatar-filters"></div>');
  const containerCards = $('<div id="dinatar-container-profiles"></div>');
  dinatar.append(containerFilters);
  dinatar.append(containerCards);

  data = await fetchData(id, name, get_only);
  filters = parsedFilters(filter_options, data);
  colors = await fetchColors(id);
  createFilters(filters, data);
  createProfiles(data, colors);
  createModal();
  initModal()
});
