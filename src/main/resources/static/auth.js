/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(elementId, message, type) {

    const element =
        document.getElementById(elementId);

    element.innerText = message;

    element.className =
        "message " + type;
}


/* =========================================
   CLEAR MESSAGE
========================================= */

function clearMessage(elementId) {

    const element =
        document.getElementById(elementId);

    element.innerText = "";

    element.className = "message";
}


/* =========================================
   SHOW LOGIN
========================================= */

function showLogin() {

    document.getElementById(
        "registerSection"
    ).style.display = "none";


    document.getElementById(
        "loginSection"
    ).style.display = "block";


    clearMessage("registerMessage");

}


/* =========================================
   SHOW REGISTER
========================================= */

function showRegister() {

    document.getElementById(
        "loginSection"
    ).style.display = "none";


    document.getElementById(
        "registerSection"
    ).style.display = "block";


    clearMessage("loginMessage");

}


/* =========================================
   LOGIN
========================================= */

async function login() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    /* -------------------------------
       VALIDATION
    -------------------------------- */

    if (!email) {

        showMessage(
            "loginMessage",
            "Please enter your email.",
            "error"
        );

        return;
    }


    if (!password) {

        showMessage(
            "loginMessage",
            "Please enter your password.",
            "error"
        );

        return;
    }


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    loginButton.disabled = true;

    loginButton.innerHTML =
        "<span>Logging in...</span>";


    clearMessage("loginMessage");


    try {


        /* ==============================
           LOGIN API
        ============================== */

        const response =
            await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })
                }
            );


        /* ==============================
           RESPONSE
        ============================== */

        const responseText =
            await response.text();


        console.log(
            "Login Status:",
            response.status
        );


        console.log(
            "Login Response:",
            responseText
        );


        let data = {};

        try {

            data =
                JSON.parse(responseText);

        } catch (e) {

            data = {};
        }


        /* ==============================
           LOGIN FAILED
        ============================== */

        if (!response.ok) {

            let errorMessage =
                "Invalid email or password.";


            if (data.message) {

                errorMessage =
                    data.message;

            } else if (data.error) {

                errorMessage =
                    data.error;

            } else if (responseText) {

                errorMessage =
                    responseText;
            }


            showMessage(
                "loginMessage",
                errorMessage,
                "error"
            );


            loginButton.disabled = false;

            loginButton.innerHTML =
                "<span>Login</span><span>→</span>";


            return;
        }


        /* ==============================
           JWT TOKEN
        ============================== */

        /*
           Backend mein token ka naam
           token / jwt / accessToken
           kuch bhi ho sakta hai.

           Isliye hum teeno check kar rahe hain.
        */

        const token =
            data.token ||
            data.jwt ||
            data.accessToken;


        if (!token) {

            console.error(
                "JWT token missing:",
                data
            );


            showMessage(
                "loginMessage",
                "Login successful, but JWT token was not received.",
                "error"
            );


            loginButton.disabled = false;

            loginButton.innerHTML =
                "<span>Login</span><span>→</span>";


            return;
        }


        /* ==============================
           SAVE TOKEN
        ============================== */

        localStorage.setItem(
            "token",
            token
        );


        /* ==============================
           SAVE USER DETAILS
        ============================== */

        if (data.name) {

            localStorage.setItem(
                "name",
                data.name
            );
        }


        if (data.email) {

            localStorage.setItem(
                "email",
                data.email
            );
        }


        if (data.role) {

            localStorage.setItem(
                "role",
                data.role
            );
        }


        /* ==============================
           DEBUG
        ============================== */

        console.log(
            "JWT saved:",
            localStorage.getItem("token")
        );


        console.log(
            "Name:",
            localStorage.getItem("name")
        );


        console.log(
            "Email:",
            localStorage.getItem("email")
        );


        /* ==============================
           GO TO CHAT
        ============================== */

        window.location.href =
            "/chat.html";


    } catch (error) {


        console.error(
            "Login Error:",
            error
        );


        showMessage(
            "loginMessage",
            "Cannot connect to server. Is Spring Boot running?",
            "error"
        );


        loginButton.disabled = false;

        loginButton.innerHTML =
            "<span>Login</span><span>→</span>";
    }

}


/* =========================================
   REGISTER
========================================= */

async function register() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    /* ==============================
       VALIDATION
    ============================== */

    if (!name) {

        showMessage(
            "registerMessage",
            "Please enter your name.",
            "error"
        );

        return;
    }


    if (!email) {

        showMessage(
            "registerMessage",
            "Please enter your email.",
            "error"
        );

        return;
    }


    if (!password) {

        showMessage(
            "registerMessage",
            "Please enter your password.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "registerMessage",
            "Password must be at least 6 characters.",
            "error"
        );

        return;
    }


    const registerButton =
        document.getElementById(
            "registerButton"
        );


    registerButton.disabled = true;

    registerButton.innerHTML =
        "<span>Creating Account...</span>";


    clearMessage("registerMessage");


    try {


        /* ==============================
           REGISTER API
        ============================== */

        const response =
            await fetch(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password

                    })
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Register Status:",
            response.status
        );


        console.log(
            "Register Response:",
            responseText
        );


        let data = {};

        try {

            data =
                JSON.parse(responseText);

        } catch (e) {

            data = {};
        }


        /* ==============================
           REGISTER FAILED
        ============================== */

        if (!response.ok) {

            let errorMessage =
                "Registration failed.";


            if (data.message) {

                errorMessage =
                    data.message;

            } else if (data.error) {

                errorMessage =
                    data.error;

            } else if (responseText) {

                errorMessage =
                    responseText;
            }


            showMessage(
                "registerMessage",
                errorMessage,
                "error"
            );


            registerButton.disabled = false;

            registerButton.innerHTML =
                "<span>Create Account</span><span>→</span>";


            return;
        }


        /* ==============================
           REGISTER SUCCESS
        ============================== */

        showMessage(
            "registerMessage",
            "Account created successfully! Please login.",
            "success"
        );


        /* ==============================
           CLEAR FIELDS
        ============================== */

        document.getElementById(
            "registerName"
        ).value = "";


        document.getElementById(
            "registerEmail"
        ).value = "";


        document.getElementById(
            "registerPassword"
        ).value = "";


        registerButton.disabled = false;

        registerButton.innerHTML =
            "<span>Create Account</span><span>→</span>";


        /* ==============================
           AFTER 1.5 SEC → LOGIN
        ============================== */

        setTimeout(
            function () {

                showLogin();

                document.getElementById(
                    "loginEmail"
                ).value = email;

            },
            1500
        );


    } catch (error) {


        console.error(
            "Register Error:",
            error
        );


        showMessage(
            "registerMessage",
            "Cannot connect to server. Is Spring Boot running?",
            "error"
        );


        registerButton.disabled = false;

        registerButton.innerHTML =
            "<span>Create Account</span><span>→</span>";
    }

}