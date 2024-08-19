class App {
    constructor(root_id, data_url) {
        this.root_element = document.getElementById(root_id);
        this.data_url = data_url;

        window.addEventListener('hashchange', () => {
            this.render();
        });
    }

    data() {
        if (localStorage.getItem('data')) {
            return Promise.resolve(JSON.parse(localStorage.getItem('data')));
        } else {
            return fetch(this.data_url)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('data', JSON.stringify(data));
                    return data;
                });
        }
    }

    url(url) {
        return '#' + url;
    }

    build_element(data) {
        let element = document.createElement(data.type);

        if (data.id) {
            element.id = data.id;
        }

        if (data.class) {
            element.className = data.class;
        }

        if (data.text) {
            element.innerHTML = data.text;
        }

        if (data.children) {
            data.children.forEach(child => {
                element.appendChild(this.build_element(child));
            });
        }

        if (data.attributes) {
            data.attributes.forEach(attribute => {
                element.setAttribute(attribute.name, attribute.value);
            });
        }

        return element
    }

    getHash() {
        let hash = window.location.hash.slice(1);

        if (hash === '') {
            return '/';
        }

        return hash;
    }

    render() {
        this.data().then(this.render_content.bind(this));

        this.root_element.innerHTML = `
            <h1>Hello World</h1>
        `;
    }

    render_content(data) {
        this.root_element.innerHTML = '';
        this.render_menu(data);
        let content = data.pages[this.getHash()];

        if (!content) {
            content = data.pages['/404'];
        }

        this.render_page(content);
    }

    render_page(page) {
        document.title = page.title;
        let content = this.build_element(page);

        this.root_element.appendChild(content);
    }

    render_menu(data) {
        let menu = document.createElement('ul');

        Object.keys(data.nav).forEach(url => {
            let item = {
                type: 'li',
                children: [
                    {
                        type: 'a',
                        text: data.nav[url],
                        attributes: [
                            {
                                name: 'href',
                                value: this.url(url)
                            }
                        ]
                    }
                ]
            };

            if (url === this.getHash()) {
                item.children[0].attributes.push({
                    name: 'class',
                    value: 'active'
                });
            }

            menu.appendChild(this.build_element(item));
            // menu.appendChild(document.createTextNode(' | '));
        });

        let conainer = document.createElement('nav');
        conainer.appendChild(menu);

        this.root_element.appendChild(conainer);
    }
}