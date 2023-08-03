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
  const columns = data.values[0];
  const values = data.values.slice(1);

  let new_data = [];
  values.forEach((items) => {
    let obj = {};
    items.forEach((value, i) => {
      if (columns[i].length != 0 && value.length != 0) {
        // console.log(columns[i], value)
        obj[columns[i]] = value;
      }
    });
    new_data.push(obj);
  });

  let final = [];

  let splitter = only.map((element) => {
    return element.split(":");
  });

  let total = splitter.length;
  new_data.map((item) => {
    let count = 0;
    splitter.forEach(([column, value]) => {
      if (item[column].includes(value)) {
        count += 1;
      }
    });
    if (count == total) {
      final.push(item);
    }
  });

  return final;
};

const parseColors = (data) =>{
  let final = []
  data.values.forEach(item => {
    final[item[0]] = item[1]
  });
  return final
}

const fetchColors = async (id) => {
  const res_colors = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Colors?key=AIzaSyC3rM7IB5ZQ6zNoY88SaMENJi5mOwmGdqQ`
  );

  const data = await res_colors.json()

  return parseColors(data);
};

const fetchData = async (id, name) => {
  const res_data = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${name}?key=AIzaSyC3rM7IB5ZQ6zNoY88SaMENJi5mOwmGdqQ`
  );

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

const buildProfile= (i,item, colors) => {
  const profile = document.createElement("a");
  profile.href = "#profile_"+i
  const profileContent = document.createElement("div");
  const profileContentImage = document.createElement("div");
  const profileImage = document.createElement("img");
  const profileName = document.createElement("div");
  const profileNameSpan = document.createElement("span");
  const profileAction = document.createElement("div");

  profileAction.style = getColorByTeam(item.Partido, colors);
  profileAction.className = "profile-action";
  profileAction.innerHTML = `<button><span>${item["Cargo que busca"]}</span> <span>${item.Partido}</span></button>`;
  profileName.className = "profile-name";
  profileNameSpan.innerText = `${item["Nombres"]} ${item["Apellido 1"]} ${item["Apellido 2"]}`
  profileImage.src = item.Foto;
  profileContentImage.className = "profile-image";
  profileContent.className = "profile-content";
  profile.className = "dinatar-profile";
  profileNameSpan.className= 'name'

  profileName.append(profileNameSpan)
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
    const modal =  document.createElement("div");
    const allsCollections = Object.keys(filters).filter((element) => {
      const { value } = filters[element];
      if (value != "Todos") {
        return true;
      }
    });

    let count = 0;
    allsCollections.forEach((step) => {
      const value = filters[step].value;
      // console.log(step, query)
      if (item[step] == value) {
        count++;
      }
    });

    if (allsCollections.length == count) {
      containerProfiles.append(buildProfile(i,item, colors));
    }

    console.log(item)
    modal.id = "profile_"+i
    modal.className = "dinatar-popup"
    modal.innerHTML = `
      <div class="dinatar-container">
        <div class="dinatar__content">
          <div class="header">
            <div class="image">
              <img src="${item["Foto"]}" alt="">
            </div>
            <div class="info">
              <h3 class="name">${item["Nombres"]} ${item["Apellido 1"]} ${item["Apellido 2"]}</h3>
              <div class="work">${item['Cargo que busca']}</div>
              <div class="city">${item['Ciudad']}</div>
              <div class="coavales">
                <strong>Coavales: </strong> ${item['Coavales']}
              </div>
            </div>
          </div>
          <p class="dinatar__text">
            ${item['Perfil']}
          </p>
          <div class="dinatar-button-close-container">
            <a href="#" class="dinatar-button-close">X</a>
          </div>
        </div>
      </div>
    `
    dinatar.append(modal)
  });
  containerProfiles.id = "dinatar-container-profiles";
  dinatar.appendChild(containerProfiles);
};

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
  if(_colors){
    colors = await fetchColors(id);
  }

  const data = parseData(res_data, only);

  let filters = getFilters(filters_options, data);

  createFilters(filters);
  createProfiles(filters, data, colors);

  document.querySelector("#select-dinatar").addEventListener("change", (e) => {
    const select_filter = e.target.getAttribute("filter");
    const value = e.target.value;
    filters[select_filter].value = value;

    createProfiles(filters, data, colors);
  });
});
