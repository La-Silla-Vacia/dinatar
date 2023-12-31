let filters_for_show_data = {};

const filterValues = (data) => {
  let final = [];
  data.forEach((element) => {
    let filtered = [];
    element.forEach((item) => {
      if (item.length) {
        filtered.push(item);
      }
    });
    final.push(filtered);
  });

  return final;
};

const parseData = (data, only) => {
  // const columns = data.values[0];
  const values = data.values;

  var new_data = [];

  for (var i = 1; i < values.length; i++) {
    new_data[i - 1] = {};
    for (var k = 0; k < values[0].length && k < values[i].length; k++) {
      var key = values[0][k];
      if (key.length != 0) {
        new_data[i - 1][key] = values[i][k];
      }
    }
  }

  // console.log(new_data)

  // let new_data = [];
  // values.forEach((items) => {
  //   let obj = {};
  //   items.forEach((value, i) => {
  //     if (columns[i].length != 0 && value.length != 0) {
  //       // console.log(columns[i], value)
  //       obj[columns[i]] = value;
  //     }
  //   });
  //   new_data.push(obj);
  // });

  let final = [];

  let splitter = only.map((element) => {
    return element.split(":");
  });

  let total = splitter.length;
  new_data.map((item) => {
    let count = 0;
    splitter.forEach(([column, value]) => {
      if (item[column]?.includes(value)) {
        count += 1;
      }
    });
    if (count == total) {
      final.push(item);
    }
  });

  return final;
};

const parseColors = (data) => {
  try {
    let final = [];
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

const fetchData = async (id, name) => {
  const res_data = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${name}?key=AIzaSyD476egRKXU8tY8HD2z55SuXYdjCplBENI`
  );

  // const res_data = await fetch(`https://dinatar.gabbler.io/sheets/${name}/${id}`)

  return await res_data.json();
};

const getFilters = (filters, data) => {
  let newsFilters = {};
  filters.forEach((item) => {
    let options = ["Todos"];
    data.forEach((element) => {
      if (!options.includes(element[item])) {
        options.push(element[item]);
      }
    });
    newsFilters[item] = {
      value: "Todos",
      options: options,
    };
  });

  return newsFilters;
};

const createFilters = (filters) => {
  const dinatar = document.getElementById("dinatar");
  const containerFilters = document.createElement("div");
  containerFilters.className = "dinatar-container-filters";

  Object.keys(filters).forEach((item) => {
    const label = item;
    const value = filters[item].value;
    const _options = filters[item].options;

    const filterContainer = document.createElement("div");
    const filterTitle = document.createElement("div");
    const filterSelectContainer = document.createElement("div");
    const filterSelect = document.createElement("select");

    filterContainer.className = "filter-container";
    filterTitle.className = "select-dinatar-title";
    filterTitle.innerText = label;
    filterSelectContainer.className = "select-container-dinatar";
    filterSelect.id = "select-dinatar";

    _options.forEach((option) => {
      const options = document.createElement("option");
      options.value = option;
      options.innerText = option;
      filterSelect.appendChild(options);
    });

    filterSelect.value = value;
    filterSelect.setAttribute("filter", label);
    filterSelectContainer.append(filterSelect);
    filterContainer.appendChild(filterTitle);
    filterContainer.appendChild(filterSelectContainer);
    containerFilters.append(filterContainer);
  });

  dinatar.appendChild(containerFilters);
};

const getColorByTeam = (team, colors) => {
  const color = colors[team];

  if (color) {
    return `background-color: ${color}`;
  } else {
    return `background-color: rgb(61, 61, 61)`;
  }
};

const buildProfile = (i, item, colors) => {
  const profile = document.createElement("div");
  profile.id = "#profile_" + i;
  profile.onclick = () => openModal(i);
  const profileContent = document.createElement("div");
  const profileContentImage = document.createElement("div");
  const profileImage = document.createElement("img");
  const profileName = document.createElement("div");
  const profileNameSpan = document.createElement("span");
  const profileAction = document.createElement("div");

  const cargo_que_busca = item["Cargo que busca"];
  const partido = item.Partido;

  const parte_1 = `<strong>${item["Cargo que busca"]}</strong>`;
  const parte_2 = `<strong>${item.Partido}</strong>`;

  profileAction.style = getColorByTeam(item.Partido, colors);
  profileAction.className = "profile-action";
  profileAction.innerHTML = `<button> ${cargo_que_busca ? parte_1 : ""} ${
    partido ? parte_2 : ""
  } </button>`;
  profileName.className = "profile-name";
  profileNameSpan.innerText = `${item["Nombres"]} ${item["Apellido 1"]} ${item["Apellido 2"]}`;
  profileImage.src = item.Foto;
  profileContentImage.className = "profile-image";
  profileContent.className = "profile-content";
  profile.className = "dinatar-profile";
  profileNameSpan.className = "name";

  profileName.append(profileNameSpan);
  profileContentImage.append(profileImage);
  profileContent.append(profileContentImage);
  profileContent.append(profileName);
  profile.append(profileContent);
  profile.append(profileAction);

  return profile;
};

const createProfiles = (filters, data, colors, step_count = true) => {
  const dinatar = document.getElementById("dinatar");

  const containerProfiles =
    document.getElementById("dinatar-container-profiles") ||
    document.createElement("div");
  containerProfiles.innerHTML = "";

  data.forEach((item, i) => {
    const modal = document.createElement("div");
    const allsCollections = Object.keys(filters).filter((element) => {
      const { value } = filters[element];
      if (value != "Todos") {
        return true;
      }
    });

    let count = 0;
    allsCollections.forEach((step) => {
      const value = filters[step].value;
      if (item[step] == value) {
        count++;
      }
    });

    if (allsCollections.length == count) {
      containerProfiles.append(buildProfile(i, item, colors));
    }

    // console.log(item)
    modal.id = "modal_profile_" + i;
    modal.className = "dinatar-popup ";
    modal.innerHTML = `
      <div class="dinatar__content">
        <div class="header">
          <div class="image">
            <img src="${item["Foto"]}" alt="">
          </div>
          <div class="info">
            <div>
              <h3 class="name">${item["Nombres"]} ${item["Apellido 1"]} ${
      item["Apellido 2"]
    }</h3>
            </div>
            <button onclick="closeModal('modal_profile_${i}')" class="dinatar-button-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </button>
        </div>
        </div>
        <div class="another-info">
          <div class="work">${item["Cargo que busca"] ? item["Cargo que busca"] : ''}</div>
          <div class="city">${item["Territorio"] ? item["Territorio"] : ''}</div>
          ${
            item["Coavales"]
              ? `<div class="coavales">
            <strong>Coavales: </strong> ${item["Coavales"]}
          </div>`
              : ""
          }
          
        </div>
        <p class="dinatar__text">
          ${item["Perfil"]}
        </p>
      </div>
    `;
    dinatar.append(modal);
  });
  containerProfiles.id = "dinatar-container-profiles";
  dinatar.appendChild(containerProfiles);
};

const on_event = (e, filters, data, colors) => {
  const select_filter = e.target.getAttribute("filter");
  const value = e.target.value;
  filters[select_filter].value = value;

  createProfiles(filters, data, colors);
};

function openModal(id) {
  const modal = document.getElementById(`modal_profile_${id}`);
  modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", async () => {
  let _colors;
  let only;

  try {
    _colors = with_colors;
  } catch (error) {
    _colors = false;
  }

  try {
    only = get_only;
  } catch (error) {
    only = [];
  }
  let colors = {};

  const res_data = await fetchData(id, name, _colors);
  if (_colors) {
    colors = await fetchColors(id);
  }

  const data = parseData(res_data, only);

  let filters = getFilters(filters_options, data);

  createFilters(filters);
  createProfiles(filters, data, colors);

  const targets = document.querySelectorAll("#select-dinatar");
  targets.forEach((element) => {
    element.addEventListener("change", (e) => {
      on_event(e, filters, data, colors);
    });
  });

  // document.querySelector("#select-dinatar").addEventListener("change", (e) => {
  // const select_filter = e.target.getAttribute("filter");
  // const value = e.target.value;
  // filters[select_filter].value = value;

  // createProfiles(filters, data, colors);
  // });
});
