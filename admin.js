(function () {
    "use strict";

    const DRAFT_KEY = "siteContentDraft";
    const DEFAULT_ICON = "fas fa-code";
    // Client-side gate only. Change both hashes together when changing the password.
    const PASSWORD_HASH = "4a1979b29e84d77fdf5ed772531ec92470f7a2388c95921ec76b35e72014c7f2";
    const PASSWORD_FALLBACK_HASH = "af2eedc4";
    const UNLOCK_KEY = "adminUnlocked";

    const embedded = normalize(deepClone(window.SITE_CONTENT || emptyContent()));
    const draft = loadDraft();

    let state = draft ? normalize(draft) : deepClone(embedded);
    let editing = { project: null, person: null, logo: null };
    let pendingPersonImage = "";
    let pendingLogoImage = "";
    let saveTimer = null;
    let toastTimer = null;
    let adminStarted = false;

    const $ = id => document.getElementById(id);

    document.body.classList.toggle("admin-locked", !isUnlocked());

    function text(value) {
        return typeof value === "string" ? value.trim() : "";
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function emptyContent() {
        return {
            version: 1,
            projects: [],
            people: [],
            contacts: {
                location: "",
                status: "",
                emails: [],
                socials: []
            },
            logos: []
        };
    }

    function normalize(raw) {
        const content = raw && typeof raw === "object" ? raw : {};
        const contacts = content.contacts && typeof content.contacts === "object"
            ? content.contacts
            : {};

        return {
            version: 1,
            projects: (Array.isArray(content.projects) ? content.projects : [])
                .filter(project => project && typeof project === "object")
                .map((project, index) => ({
                    id: text(project.id) || "project-" + (index + 1),
                    section: project.section === "academic" ? "academic" : "featured",
                    icon: text(project.icon) || DEFAULT_ICON,
                    title: text(project.title),
                    type: text(project.type),
                    status: text(project.status),
                    description: text(project.description),
                    tech: Array.isArray(project.tech)
                        ? project.tech.map(text).filter(Boolean)
                        : [],
                    link: text(project.link),
                    linkLabel: text(project.linkLabel),
                    contributors: Array.isArray(project.contributors)
                        ? project.contributors.map(String)
                        : []
                })),
            people: (Array.isArray(content.people) ? content.people : [])
                .filter(person => person && typeof person === "object")
                .map((person, index) => ({
                    id: text(person.id) || "person-" + (index + 1),
                    name: text(person.name),
                    url: text(person.url),
                    label: text(person.label),
                    icon: text(person.icon) || "fab fa-github",
                    avatarImage: text(person.avatarImage)
                })),
            contacts: {
                location: text(contacts.location),
                status: text(contacts.status),
                emails: Array.isArray(contacts.emails)
                    ? contacts.emails.map(text).filter(Boolean)
                    : [],
                socials: (Array.isArray(contacts.socials) ? contacts.socials : [])
                    .filter(social => social && typeof social === "object")
                    .map((social, index) => ({
                        id: text(social.id) || "social-" + (index + 1),
                        label: text(social.label),
                        url: text(social.url),
                        icon: text(social.icon) || "fas fa-link",
                        hero: social.hero !== false,
                        footer: social.footer !== false
                    }))
            },
            logos: (Array.isArray(content.logos) ? content.logos : [])
                .filter(logo => logo && typeof logo === "object")
                .map((logo, index) => ({
                    id: text(logo.id) || "logo-" + (index + 1),
                    name: text(logo.name),
                    url: text(logo.url),
                    image: text(logo.image)
                }))
        };
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function persistDraft() {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
            setSaveState("Draft saved in this browser");
        } catch (error) {
            setSaveState("Draft is too large to autosave", true);
        }
    }

    function scheduleSave() {
        clearTimeout(saveTimer);

        saveTimer = setTimeout(persistDraft, 300);
    }

    function setSaveState(message, isError) {
        const node = $("saveState");

        if (!node) return;

        node.textContent = message;
        node.classList.toggle("error", Boolean(isError));
    }

    function el(tag, className, content) {
        const node = document.createElement(tag);

        if (className) node.className = className;
        if (content) node.textContent = content;

        return node;
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60);
    }

    function makeId(prefix, title, items) {
        const base = slugify(title) || prefix;
        const taken = new Set(items.map(item => item.id));
        let id = base;
        let number = 2;

        while (taken.has(id)) {
            id = base + "-" + number;
            number++;
        }

        return id;
    }

    function splitTags(value) {
        return String(value || "")
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(Boolean);
    }

    function imageSource(value) {
        const url = text(value);

        if (!url) return "";
        if (/^data:image\//i.test(url)) return url;
        if (/^https?:\/\//i.test(url)) return url;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;

        return "";
    }

    function toast(message, type, duration) {
        const node = $("toast");

        if (!node) return;

        node.textContent = message;
        node.className = "toast show " + (type || "success");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            node.className = "toast " + (type || "success");
        }, duration || 3500);
    }

    function moveItem(items, index, delta) {
        const target = index + delta;

        if (target < 0 || target >= items.length) return false;

        const item = items.splice(index, 1)[0];

        items.splice(target, 0, item);

        return true;
    }

    function actionButton(label, icon, handler, disabled, variant) {
        const button = document.createElement("button");
        const iconNode = document.createElement("i");

        button.type = "button";
        button.className = "icon-btn" + (variant ? " " + variant : "");
        button.title = label;
        button.setAttribute("aria-label", label);
        button.disabled = Boolean(disabled);

        iconNode.className = "fas " + icon;

        button.appendChild(iconNode);
        button.addEventListener("click", event => {
            event.stopPropagation();
            handler();
        });

        return button;
    }

    function makeListItem(options) {
        const item = el("div", "item");

        if (options.editing) item.classList.add("editing");

        const thumb = imageSource(options.thumb);

        if (thumb) {
            const image = document.createElement("img");

            image.className = "item-thumb";
            image.src = thumb;
            image.alt = "";

            item.appendChild(image);
        }

        const info = el("div", "item-info");

        info.appendChild(el("strong", "", options.title || "Untitled"));
        info.appendChild(el("span", "item-meta", options.meta || ""));

        item.appendChild(info);

        const actions = el("div", "item-actions");

        actions.appendChild(actionButton(
            "Move up",
            "fa-arrow-up",
            () => options.onMove(-1),
            options.index === 0
        ));

        actions.appendChild(actionButton(
            "Move down",
            "fa-arrow-down",
            () => options.onMove(1),
            options.index === options.total - 1
        ));

        actions.appendChild(actionButton("Edit", "fa-pen", options.onEdit));
        actions.appendChild(actionButton(
            "Delete",
            "fa-trash",
            options.onDelete,
            false,
            "danger"
        ));

        item.appendChild(actions);

        item.addEventListener("click", options.onEdit);

        return item;
    }

    function renderProjectList() {
        const list = $("projectList");

        if (!list) return;

        list.innerHTML = "";

        if (!state.projects.length) {
            list.appendChild(el(
                "p",
                "empty",
                "No projects yet. Click New to add one."
            ));
            return;
        }

        state.projects.forEach((project, index) => {
            const meta = [
                project.section === "academic" ? "Academic" : "Featured",
                project.type
            ].filter(Boolean).join(" \u2022 ");

            list.appendChild(makeListItem({
                title: project.title || "Untitled project",
                meta: meta,
                index: index,
                total: state.projects.length,
                editing: editing.project === project.id,
                onMove: delta => {
                    if (moveItem(state.projects, index, delta)) {
                        persistDraft();
                        renderProjectList();
                    }
                },
                onEdit: () => editProject(project.id),
                onDelete: () => deleteProject(project.id)
            }));
        });
    }

    function renderPersonList() {
        const list = $("personList");

        if (!list) return;

        list.innerHTML = "";

        if (!state.people.length) {
            list.appendChild(el(
                "p",
                "empty",
                "No people yet. Add someone so they can appear as a contributor."
            ));
            return;
        }

        state.people.forEach((person, index) => {
            list.appendChild(makeListItem({
                title: person.name || "Unnamed person",
                meta: person.url || person.label || "No link",
                thumb: person.avatarImage,
                index: index,
                total: state.people.length,
                editing: editing.person === person.id,
                onMove: delta => {
                    if (moveItem(state.people, index, delta)) {
                        persistDraft();
                        renderPersonList();
                    }
                },
                onEdit: () => editPerson(person.id),
                onDelete: () => deletePerson(person.id)
            }));
        });
    }

    function renderLogoList() {
        const list = $("logoList");

        if (!list) return;

        list.innerHTML = "";

        if (!state.logos.length) {
            list.appendChild(el(
                "p",
                "empty",
                "No logos yet. The logo strip stays hidden until you add one."
            ));
            return;
        }

        state.logos.forEach((logo, index) => {
            list.appendChild(makeListItem({
                title: logo.name || "Unnamed logo",
                meta: logo.url || (logo.image ? "Embedded image" : "No image"),
                thumb: logo.image,
                index: index,
                total: state.logos.length,
                editing: editing.logo === logo.id,
                onMove: delta => {
                    if (moveItem(state.logos, index, delta)) {
                        persistDraft();
                        renderLogoList();
                    }
                },
                onEdit: () => editLogo(logo.id),
                onDelete: () => deleteLogo(logo.id)
            }));
        });
    }

    function readCheckedContributors() {
        return Array.from(
            document.querySelectorAll("#projectContributors input:checked")
        ).map(input => input.value);
    }

    function renderProjectContributors(selected) {
        const box = $("projectContributors");

        if (!box) return;

        const checked = Array.isArray(selected)
            ? selected
            : readCheckedContributors();

        box.innerHTML = "";

        if (!state.people.length) {
            box.appendChild(el(
                "p",
                "empty small",
                "No people yet. Add someone in the People tab first."
            ));
            return;
        }

        state.people.forEach(person => {
            const label = el("label", "check");
            const input = document.createElement("input");
            const name = el("span", "", person.name || "Unnamed person");

            input.type = "checkbox";
            input.value = person.id;
            input.checked = checked.includes(person.id);

            label.appendChild(input);
            label.appendChild(name);
            box.appendChild(label);
        });
    }

    function clearProjectForm() {
        editing.project = null;

        $("projectForm").reset();
        $("projectId").value = "";
        $("projectIcon").value = DEFAULT_ICON;
        $("projectFormTitle").textContent = "New project";

        renderProjectContributors([]);
        renderProjectList();
    }

    function editProject(id) {
        const project = state.projects.find(item => item.id === id);

        if (!project) return;

        editing.project = project.id;

        $("projectId").value = project.id;
        $("projectTitle").value = project.title;
        $("projectSection").value = project.section;
        $("projectType").value = project.type;
        $("projectStatus").value = project.status;
        $("projectIcon").value = project.icon;
        $("projectDescription").value = project.description;
        $("projectTech").value = project.tech.join(", ");
        $("projectLink").value = project.link;
        $("projectLinkLabel").value = project.linkLabel;
        $("projectFormTitle").textContent = "Edit project";

        renderProjectContributors(project.contributors);
        renderProjectList();
    }

    function deleteProject(id) {
        const project = state.projects.find(item => item.id === id);

        if (!project) return;

        if (!confirm("Delete project \"" + (project.title || "Untitled") + "\"?")) {
            return;
        }

        state.projects = state.projects.filter(item => item.id !== id);

        if (editing.project === id) {
            clearProjectForm();
        }

        persistDraft();
        renderProjectList();
        toast("Project deleted");
    }

    function saveProject() {
        const title = $("projectTitle").value.trim();

        if (!title) {
            toast("A project needs a title.", "error");
            return;
        }

        const project = {
            id: editing.project || makeId("project", title, state.projects),
            section: $("projectSection").value === "academic"
                ? "academic"
                : "featured",
            icon: $("projectIcon").value.trim() || DEFAULT_ICON,
            title: title,
            type: $("projectType").value.trim(),
            status: $("projectStatus").value.trim(),
            description: $("projectDescription").value.trim(),
            tech: splitTags($("projectTech").value),
            link: $("projectLink").value.trim(),
            linkLabel: $("projectLinkLabel").value.trim(),
            contributors: readCheckedContributors()
        };

        if (editing.project) {
            const index = state.projects.findIndex(
                item => item.id === editing.project
            );

            if (index !== -1) {
                state.projects[index] = project;
            } else {
                state.projects.push(project);
            }
        } else {
            state.projects.push(project);
        }

        editing.project = project.id;

        $("projectId").value = project.id;
        $("projectFormTitle").textContent = "Edit project";

        persistDraft();
        renderProjectList();
        renderProjectContributors(project.contributors);
        toast("Project saved");
    }

    function clearPersonForm() {
        editing.person = null;

        $("personForm").reset();
        $("personId").value = "";
        $("personFormTitle").textContent = "New person";

        pendingPersonImage = "";

        updatePersonPreview();
        renderPersonList();
    }

    function editPerson(id) {
        const person = state.people.find(item => item.id === id);

        if (!person) return;

        editing.person = person.id;
        pendingPersonImage = person.avatarImage;

        $("personId").value = person.id;
        $("personName").value = person.name;
        $("personUrl").value = person.url;
        $("personLabel").value = person.label;
        $("personIcon").value = person.icon;
        $("personImageUrl").value = /^data:image\//i.test(person.avatarImage)
            ? ""
            : person.avatarImage;
        $("personFormTitle").textContent = "Edit person";

        updatePersonPreview();
        renderPersonList();
    }

    function deletePerson(id) {
        const person = state.people.find(item => item.id === id);

        if (!person) return;

        if (!confirm(
            "Delete " + (person.name || "this person") +
            "? They will also be removed from every project's contributors."
        )) {
            return;
        }

        state.people = state.people.filter(item => item.id !== id);

        state.projects.forEach(project => {
            project.contributors = project.contributors.filter(
                contributorId => contributorId !== id
            );
        });

        if (editing.person === id) {
            clearPersonForm();
        }

        persistDraft();
        renderPersonList();
        renderProjectContributors();
        toast("Person deleted");
    }

    function savePerson() {
        const name = $("personName").value.trim();

        if (!name) {
            toast("A person needs a name.", "error");
            return;
        }

        const person = {
            id: editing.person || makeId("person", name, state.people),
            name: name,
            url: $("personUrl").value.trim(),
            label: $("personLabel").value.trim(),
            icon: $("personIcon").value.trim() || "fab fa-github",
            avatarImage: pendingPersonImage
        };

        if (editing.person) {
            const index = state.people.findIndex(
                item => item.id === editing.person
            );

            if (index !== -1) {
                state.people[index] = person;
            } else {
                state.people.push(person);
            }
        } else {
            state.people.push(person);
        }

        editing.person = person.id;

        $("personId").value = person.id;
        $("personFormTitle").textContent = "Edit person";

        persistDraft();
        renderPersonList();
        renderProjectContributors();
        toast("Person saved");
    }

    function clearLogoForm() {
        editing.logo = null;

        $("logoForm").reset();
        $("logoId").value = "";
        $("logoFormTitle").textContent = "New logo";

        pendingLogoImage = "";

        updateLogoPreview();
        renderLogoList();
    }

    function editLogo(id) {
        const logo = state.logos.find(item => item.id === id);

        if (!logo) return;

        editing.logo = logo.id;
        pendingLogoImage = logo.image;

        $("logoId").value = logo.id;
        $("logoName").value = logo.name;
        $("logoUrl").value = logo.url;
        $("logoImageUrl").value = /^data:image\//i.test(logo.image)
            ? ""
            : logo.image;
        $("logoFormTitle").textContent = "Edit logo";

        updateLogoPreview();
        renderLogoList();
    }

    function deleteLogo(id) {
        const logo = state.logos.find(item => item.id === id);

        if (!logo) return;

        if (!confirm("Delete logo \"" + (logo.name || "Untitled") + "\"?")) {
            return;
        }

        state.logos = state.logos.filter(item => item.id !== id);

        if (editing.logo === id) {
            clearLogoForm();
        }

        persistDraft();
        renderLogoList();
        toast("Logo deleted");
    }

    function saveLogo() {
        const name = $("logoName").value.trim();
        const image = pendingLogoImage;

        if (!name && !image) {
            toast("Add a logo name, an image, or both.", "error");
            return;
        }

        const logo = {
            id: editing.logo || makeId("logo", name, state.logos),
            name: name,
            url: $("logoUrl").value.trim(),
            image: image
        };

        if (editing.logo) {
            const index = state.logos.findIndex(
                item => item.id === editing.logo
            );

            if (index !== -1) {
                state.logos[index] = logo;
            } else {
                state.logos.push(logo);
            }
        } else {
            state.logos.push(logo);
        }

        editing.logo = logo.id;

        $("logoId").value = logo.id;
        $("logoFormTitle").textContent = "Edit logo";

        persistDraft();
        renderLogoList();
        toast("Logo saved");
    }

    function renderContactsForm() {
        $("contactLocation").value = state.contacts.location;
        $("contactStatus").value = state.contacts.status;
        $("contactEmails").value = state.contacts.emails.join("\n");

        renderSocialRows();
    }

    function socialInput(field, placeholder, value, type) {
        const input = document.createElement("input");

        input.type = type || "text";
        input.placeholder = placeholder;
        input.value = value || "";
        input.dataset.field = field;

        return input;
    }

    function socialCheck(field, labelText, checked) {
        const label = el("label", "check compact");
        const input = document.createElement("input");
        const span = el("span", "", labelText);

        input.type = "checkbox";
        input.dataset.field = field;
        input.checked = checked;

        label.appendChild(input);
        label.appendChild(span);

        return label;
    }

    function renderSocialRows() {
        const wrap = $("socialRows");

        if (!wrap) return;

        wrap.innerHTML = "";

        if (!state.contacts.socials.length) {
            wrap.appendChild(el(
                "p",
                "empty small",
                "No social links yet. Click Add social."
            ));
            return;
        }

        state.contacts.socials.forEach((social, index) => {
            const row = el("div", "social-row");

            row.dataset.index = index;

            row.appendChild(socialInput("label", "Label", social.label));
            row.appendChild(socialInput("url", "https://...", social.url, "url"));
            row.appendChild(socialInput("icon", "fab fa-github", social.icon));
            row.appendChild(socialCheck("hero", "Hero", social.hero !== false));
            row.appendChild(socialCheck("footer", "Footer", social.footer !== false));

            const remove = actionButton("Remove", "fa-xmark", () => {
                state.contacts.socials.splice(index, 1);
                persistDraft();
                renderSocialRows();
                toast("Social link removed");
            }, false, "danger");

            row.appendChild(remove);
            wrap.appendChild(row);
        });
    }

    function updatePersonPreview() {
        setPreview("personImagePreview", pendingPersonImage, "Avatar preview");
    }

    function updateLogoPreview() {
        setPreview("logoImagePreview", pendingLogoImage, "Logo preview");
    }

    function setPreview(id, value, alt) {
        const preview = $(id);

        if (!preview) return;

        preview.innerHTML = "";

        const src = imageSource(value);

        if (!src) {
            preview.appendChild(el("span", "preview-empty", "No image"));
            return;
        }

        const image = document.createElement("img");

        image.src = src;
        image.alt = alt;

        image.addEventListener("error", () => {
            preview.innerHTML = "";
            preview.appendChild(el(
                "span",
                "preview-empty",
                "Image could not be loaded"
            ));
        });

        preview.appendChild(image);
    }

    function resizeImage(file, maxSize) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type || !file.type.startsWith("image/")) {
                reject(new Error("Please choose an image file."));
                return;
            }

            const reader = new FileReader();

            reader.onerror = () => reject(new Error("Could not read that file."));

            reader.onload = () => {
                const image = new Image();

                image.onerror = () => reject(new Error("Could not load that image."));

                image.onload = () => {
                    const scale = Math.min(
                        1,
                        maxSize / Math.max(image.width, image.height)
                    );
                    const canvas = document.createElement("canvas");

                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));

                    canvas.getContext("2d").drawImage(
                        image,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    try {
                        resolve(canvas.toDataURL("image/png"));
                    } catch (error) {
                        reject(new Error("Could not process that image."));
                    }
                };

                image.src = reader.result;
            };

            reader.readAsDataURL(file);
        });
    }

    function exportContent() {
        const json = JSON.stringify(state, null, 4);
        const output = [
            "/*",
            " * Site content for Clyde's Profile.",
            " *",
            " * Generated by admin.html on " + new Date().toISOString() + ".",
            " * Replace content.js in the repo with this file and commit.",
            " */",
            "window.SITE_CONTENT = " + json + ";",
            ""
        ].join("\n");
        const blob = new Blob([output], {
            type: "text/javascript;charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "content.js";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        setSaveState("Exported \u2014 replace content.js in the repo");

        toast(
            "content.js downloaded. Replace the file in your repo and commit it.",
            "success",
            6000
        );
    }

    function parseContentFile(value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            // Fall through to the content.js wrapper.
        }

        const start = value.indexOf("{");
        const end = value.lastIndexOf("}");

        if (start === -1 || end <= start) return null;

        try {
            return JSON.parse(value.slice(start, end + 1));
        } catch (error) {
            return null;
        }
    }

    function importContent(file) {
        if (!file) return;

        const reader = new FileReader();

        reader.onerror = () => toast("Could not read that file.", "error");

        reader.onload = () => {
            const parsed = parseContentFile(String(reader.result || ""));

            if (!parsed) {
                toast("That file is not valid content.js or JSON.", "error");
                return;
            }

            if (!confirm("Replace the current draft with this imported content?")) {
                return;
            }

            state = normalize(parsed);
            editing = { project: null, person: null, logo: null };

            persistDraft();
            renderAll();
            clearProjectForm();
            clearPersonForm();
            clearLogoForm();

            toast("Content imported");
        };

        reader.readAsText(file);
    }

    function renderAll() {
        renderProjectList();
        renderPersonList();
        renderLogoList();
        renderProjectContributors();
        renderContactsForm();
    }

    function bindEvents() {
        $("lockBtn").addEventListener("click", lockAdmin);

        document.querySelectorAll(".tab").forEach(tab => {
            tab.addEventListener("click", () => {
                const name = tab.dataset.tab;

                document.querySelectorAll(".tab").forEach(item => {
                    item.classList.toggle("active", item === tab);
                });

                document.querySelectorAll(".tab-panel").forEach(panel => {
                    panel.classList.toggle(
                        "active",
                        panel.dataset.panel === name
                    );
                });
            });
        });

        $("projectForm").addEventListener("submit", event => {
            event.preventDefault();
            saveProject();
        });

        $("personForm").addEventListener("submit", event => {
            event.preventDefault();
            savePerson();
        });

        $("logoForm").addEventListener("submit", event => {
            event.preventDefault();
            saveLogo();
        });

        $("contactsForm").addEventListener("submit", event => {
            event.preventDefault();
            persistDraft();
            toast("Contacts saved");
        });

        $("newProject").addEventListener("click", () => {
            clearProjectForm();
            $("projectTitle").focus();
        });

        $("newPerson").addEventListener("click", () => {
            clearPersonForm();
            $("personName").focus();
        });

        $("newLogo").addEventListener("click", () => {
            clearLogoForm();
            $("logoName").focus();
        });

        $("cancelProject").addEventListener("click", clearProjectForm);
        $("cancelPerson").addEventListener("click", clearPersonForm);
        $("cancelLogo").addEventListener("click", clearLogoForm);

        $("exportBtn").addEventListener("click", exportContent);

        $("importBtn").addEventListener("click", () => {
            $("importFile").click();
        });

        $("importFile").addEventListener("change", event => {
            importContent(event.target.files && event.target.files[0]);
            event.target.value = "";
        });

        $("resetBtn").addEventListener("click", () => {
            if (!confirm(
                "Discard the draft saved in this browser and reload content.js?"
            )) {
                return;
            }

            localStorage.removeItem(DRAFT_KEY);
            location.reload();
        });

        $("addSocial").addEventListener("click", () => {
            state.contacts.socials.push({
                id: makeId("social", "", state.contacts.socials),
                label: "",
                url: "",
                icon: "fas fa-link",
                hero: true,
                footer: true
            });

            persistDraft();
            renderSocialRows();
            toast("Social link added");
        });

        $("socialRows").addEventListener("input", event => {
            const input = event.target.closest("[data-field]");

            if (!input) return;

            const row = input.closest(".social-row");

            if (!row) return;

            const social = state.contacts.socials[Number(row.dataset.index)];

            if (!social) return;

            const field = input.dataset.field;

            if (field === "hero" || field === "footer") {
                social[field] = input.checked;
            } else {
                social[field] = input.value;
            }

            scheduleSave();
        });

        ["contactLocation", "contactStatus", "contactEmails"].forEach(id => {
            $(id).addEventListener("input", () => {
                state.contacts.location = $("contactLocation").value;
                state.contacts.status = $("contactStatus").value;
                state.contacts.emails = $("contactEmails").value
                    .split(/\r?\n/)
                    .map(item => item.trim())
                    .filter(Boolean);

                scheduleSave();
            });
        });

        $("personImageUrl").addEventListener("input", event => {
            const value = event.target.value.trim();

            if (/^data:image\//i.test(value)) return;

            pendingPersonImage = value;
            updatePersonPreview();
        });

        $("personImageFile").addEventListener("change", async event => {
            const file = event.target.files && event.target.files[0];

            if (!file) return;

            try {
                pendingPersonImage = await resizeImage(file, 192);
                $("personImageUrl").value = "";
                updatePersonPreview();
                toast("Avatar ready. Click Save person.");
            } catch (error) {
                toast(error.message || "Could not process that image.", "error");
            }

            event.target.value = "";
        });

        $("personImageClear").addEventListener("click", () => {
            pendingPersonImage = "";
            $("personImageUrl").value = "";
            updatePersonPreview();
        });

        $("logoImageUrl").addEventListener("input", event => {
            const value = event.target.value.trim();

            if (/^data:image\//i.test(value)) return;

            pendingLogoImage = value;
            updateLogoPreview();
        });

        $("logoImageFile").addEventListener("change", async event => {
            const file = event.target.files && event.target.files[0];

            if (!file) return;

            try {
                pendingLogoImage = await resizeImage(file, 256);
                $("logoImageUrl").value = "";
                updateLogoPreview();
                toast("Logo image ready. Click Save logo.");
            } catch (error) {
                toast(error.message || "Could not process that image.", "error");
            }

            event.target.value = "";
        });

        $("logoImageClear").addEventListener("click", () => {
            pendingLogoImage = "";
            $("logoImageUrl").value = "";
            updateLogoPreview();
        });
    }

    function isUnlocked() {
        try {
            return sessionStorage.getItem(UNLOCK_KEY) === "true";
        } catch (error) {
            return false;
        }
    }

    function fallbackHash(value) {
        let hash = 0x811c9dc5;

        for (let index = 0; index < value.length; index++) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 0x01000193);
        }

        return (hash >>> 0).toString(16).padStart(8, "0");
    }

    async function passwordMatches(value) {
        if (window.crypto && crypto.subtle) {
            try {
                const digest = await crypto.subtle.digest(
                    "SHA-256",
                    new TextEncoder().encode(value)
                );
                const hex = Array.from(
                    new Uint8Array(digest),
                    byte => byte.toString(16).padStart(2, "0")
                ).join("");

                return hex === PASSWORD_HASH;
            } catch (error) {
                return false;
            }
        }

        return fallbackHash(value) === PASSWORD_FALLBACK_HASH;
    }

    function setLoginError(message) {
        const error = $("loginError");

        error.textContent = message;
        error.hidden = !message;
    }

    function startAdmin() {
        if (adminStarted) return;

        adminStarted = true;
        renderAll();
        clearProjectForm();
        clearPersonForm();
        clearLogoForm();
        bindEvents();

        setSaveState(
            draft
                ? "Draft loaded from this browser"
                : "Using content.js"
        );
    }

    function unlockAdmin() {
        try {
            sessionStorage.setItem(UNLOCK_KEY, "true");
        } catch (error) {
            // Session storage can be unavailable in private modes.
        }

        document.body.classList.remove("admin-locked");
        setLoginError("");
        startAdmin();
    }

    function lockAdmin() {
        try {
            sessionStorage.removeItem(UNLOCK_KEY);
        } catch (error) {
            // Nothing to clear.
        }

        location.reload();
    }

    function bindLogin() {
        $("loginForm").addEventListener("submit", async event => {
            event.preventDefault();

            const input = $("adminPassword");
            const submit = $("loginSubmit");
            const value = input.value;

            if (!value) {
                setLoginError("Enter the password.");
                input.focus();
                return;
            }

            submit.disabled = true;
            submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking';

            const valid = await passwordMatches(value);

            submit.disabled = false;
            submit.innerHTML = '<i class="fas fa-unlock"></i> Unlock';

            if (!valid) {
                setLoginError("Incorrect password. Try again.");
                input.select();
                return;
            }

            input.value = "";
            unlockAdmin();
        });

        $("adminPassword").addEventListener("input", () => setLoginError(""));
    }

    document.addEventListener("DOMContentLoaded", () => {
        bindLogin();

        if (isUnlocked()) {
            startAdmin();
        } else {
            $("adminPassword").focus();
        }
    });
})();
