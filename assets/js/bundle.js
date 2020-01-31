(() => {
    const selector = selector => document.querySelector(selector)
    const create = element => document.createElement(element)

    const app = selector('#app');

    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const Form = create('form');

        Form.onsubmit = async e => {
            e.preventDefault();
            const [email, password] = [Form.email, Form.password]

            const {url} = await fakeAuthenticate(email.value, password.value);
            console.log('teste', url)

            location.href='#users';
            
            const users = await getDevelopersList(url);
            renderPageUsers(users);
        };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5) 
            ? button.setAttribute('disabled','disabled')
            : button.removeAttribute('disabled');
    };

    Form.innerHTML = `
    <input type="email" required name="email" placeholder="Entre com seu e-mail" class="inputField" />
    <input type="password" required name="password" placeholder="Digite sua senha supersecreta" class="inputField" />
    <button type="submit" class="btnSubmit" disabled>Enviar</button>
    `
    
    app.appendChild(Logo);
    Login.appendChild(Form);

    async function fakeAuthenticate(email, password) {
        var data
        try {
            await fetch(
                'http://www.mocky.io/v2/5dba690e3000008c00028eb6', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Authorization': 'Basic ' + `${btoa(email+password)}.${btoa('http://www.mocky.io/v2/5dba690e3000008c00028eb6')}.${(new Date()).getTime()+300000}`,
                        'Accept': 'application/json'
                    },
                    body: `email=${email}&password=${password}&grant_type='password'`
                }).then((response) => {
                    data = response.json()
                })
            } catch (error) {
                console.log(error)
        }
        return data
    }

    async function getDevelopersList(url) {
        var users
        try {
            await fetch(url, {method: 'GET'})
            .then(response => {
                users = response.json()
            })
        } catch (error) {
            console.log(error)
        }
        return users
    }

    function renderPageUsers(users) {
        app.classList.add('logged')
        Login.style.display = 'none'

        const Ul = create('ul')
        Ul.classList.add('container')

        users.forEach((user) => {
            const Li = create('li')
            Li.classList.add('dev')
            Li.innerHTML = `
            <a href='${user.html_url}' target='_blank'>
            <img src='${user.avatar_url}' class='avatar' alt='Avatar de ${user.avatar_url}'>
            <span>${user.login}</span>
            </a>
            `
            Ul.appendChild(Li)
        }) 
        app.appendChild(Ul)
    }

    // init
    (async function(){
        const rawToken = null
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href='#login';
            app.appendChild(Login);
        } else {
            location.href='#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
})()