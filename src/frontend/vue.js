new Vue({
    el: '#app,#success',
    data: {
      message: 'Willkommen im Geschenk Shop!',
      timestamp: new Date().toLocaleString(),
      searchQuery: '',
      products: [], 
      cart: [],
      showCart: false,
      showLoginPopup: false, 
  
      showStockPopup: false, 
      currentProduct: {}, 
      newStock: 0, 
      registerErrorMessage:'',

      loginForm: {
        username: '',
        password: ''
      },
      errorMessage: '', //error login message
      isLoggedIn: false, 

      showRegisterPopup: false, 
      registerForm: {
        regusername: '',
        regpassword: '',
        email: '',
        strasse: '',
        ort: '',
        plz: '',

      },

      orders: [],   
      showOrdersPopup: false,

      user: null, 
      apiUrl:'https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend', //'YOUR_BACKEND_API_URL'
    },

    computed: {
        // Filtert die Produkte basierend auf der Suchanfrage
      filteredProducts() {
        if (this.searchQuery) {
          return this.products.filter((item)=>{
          return this.searchQuery.toLowerCase().split(' ').every(v => item.name.toLowerCase().includes(v))
          })
        }
        else{
          return this.products;
        }
      },

      // Total number of books in the cart
      totalQuantity() {
        return this.cart.reduce((total, item) => total + item.anzahl, 0);
        },

        // Total price of items in the cart
      totalPrice() {
      return this.cart.reduce((total, item) => total + (item.preis * item.anzahl), 0).toFixed(2);
      },

      // MwSt
      totalMwst(){
        return (parseFloat( this.totalPrice * 0.07)).toFixed(2);
      },

      priceInclVat() {
        return (parseFloat(this.totalPrice) + parseFloat(this.totalMwst)).toFixed(2);
      },        
    },
    
      
    methods: {
      fetchData() {
        fetch("https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/products.php")
          .then(response => response.json())
          .then((data) => {
            this.products = data.products;
          })
      },
      bestellen(index) {
        const product = this.products[index];
        const cartItem = this.cart.find(item => item.name === product.name);

        if (product.anzahl > 0) { // check if Produkte verfugbar 
            if (cartItem) {
              cartItem.anzahl++; //if Produkte schon im Warenkorb -> steigt Anzahl
            } else {
              this.cart.push({ name: product.name, preis: product.preis, anzahl: 1 }); 
            }
            product.anzahl--;
          }
      },

      entfernen(index) {
        const product = this.products[index];
        const cartItem = this.cart.find(item => item.name === product.name);
            if (cartItem && cartItem.anzahl > 0) {
                cartItem.anzahl--; 
                product.anzahl++;  
                if (cartItem.anzahl === 0) {
                    this.cart = this.cart.filter(item => item.name !== product.name);
                }
            } else {
                alert("Produkte werden nicht zum Warenkorb hinzugefügt");
            }
      },

  
      warenkorbAnzeigen() {
        this.showCart = !this.showCart;
      }, 

      toggleLoginPopup() {
        this.showLoginPopup = !this.showLoginPopup;
      },

      login() {
        const loginData = {
          username: this.loginForm.username,
          password: this.loginForm.password
        };

        fetch('https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.token) {
            //if login success
            this.isLoggedIn = true;
            this.user = data.user;
            this.isAdmin = data.user.username === 'admin';
            localStorage.setItem('token', data.token);
            this.showLoginPopup = false; 

          } else {
            //if login error
            this.errorMessage = data.error;
          }
        })
        .catch(error => {
          console.error('Error:', error);
          this.errorMessage = 'Something went wrong. Please try again later.';
        });
      },

      logout() {
        this.isLoggedIn = false;
        this.user = null;
        localStorage.removeItem('token'); // remove token after logout
        this.showLoginPopup = false; // close popout after logout
        this.loginForm.username = '';
        this.loginForm.password = '';
      },

      toggleRegisterPopup() {
        this.showLoginPopup = !this.showLoginPopup;
        this.showRegisterPopup = !this.showRegisterPopup;
      },

      register() {
        const registerData = {
          regusername: this.registerForm.regusername,
          regpassword: this.registerForm.regpassword,
          email: this.registerForm.email,
          strasse: this.registerForm.strasse,
          ort: this.registerForm.ort,
          plz: this.registerForm.plz,
        };
      // Überprüfung: Benutzername und Passwort müssen eingegeben sein
      if (this.registerForm.regusername.trim() === '' || this.registerForm.regpassword.trim() === '') {
        alert("Bitte geben Sie einen Benutzernamen und ein Passwort ein.");
        return;
      }
    

        fetch('https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/register.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // register success
            alert('Erfolgreich registriert! Bitte melden Sie sich an.');
            this.toggleRegisterPopup(); 
          } else {
            // Fehler, wenn Benutzername bereits existiert
            if (data.error) {
                alert(data.error); // Zeigt die Fehlermeldung an
            } else {
                alert('Fehler bei der Registrierung!');
            }
          }
        })
      },


      checkout() {
        // Prepare cart data and total price
        const priceInclVat = this.priceInclVat * 100; // Convert price to cents
        const cartData = this.cart.map(item => ({
          name: item.name,
          preis: item.preis, // Price per unit (in cents)
          anzahl: item.anzahl
        }));
    
        // Send the cart data to the PHP backend
        fetch('https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/stripe_redirect.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceInclVat, cart: cartData })
        })
        .then(response => response.json())
        .then(data => {
          if (data.sessionUrl) {
            // Redirect the user to Stripe Checkout
            window.location.href = data.sessionUrl;
          } else {
            alert("Failed to create checkout session.");
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      },

      generateCheckoutUrl() {
        // Convert cart data and total price to URL-encoded parameters
        //const totalPrice = Math.round(this.totalPrice * 100); // Price in cents
        const priceInclVat = Math.round(this.priceInclVat * 100); // Convert to cents for Stripe
        const cartData = encodeURIComponent(JSON.stringify(this.cart.map(item => ({
          name: item.name,
          preis: Math.round(item.preis * 100), // Price in cents
          anzahl: item.anzahl
        }))));
    
        // Build URL with GET parameters
        return `https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/stripe_redirect.php?priceInclVat=${priceInclVat}&cart=${cartData}`;
      },

      async viewOrders() {
        fetch('https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/showoders.php', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if (data.orders && data.orders.length > 0) {
              this.orders = data.orders; 
              this.showLoginPopup = false;
              this.showOrdersPopup = true; 
            } else if (data.error) {
                alert(`Fehler: ${data.error}`);
            } else {
                alert('Keine Bestellungen.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Beim Abrufen der Bestellinformationen ist ein Fehler aufgetreten.');
        });
      },

    closeOrdersPopup() {
      this.showOrdersPopup = false; 
    },
    

    openStockPopup(product) {
      this.currentProduct = { ...product };  
      this.newStock = product.anzahl;  
      this.showStockPopup = true;  
    },

    //cancel the change
    closeStockPopup() {
      this.showStockPopup = false;
      this.currentProduct = {};
      this.newStock = 0;
    },

      
    async changeProductStock() {
    // Produkt-ID aus der Produktliste basierend auf dem ausgewählten Produktnamen abrufen
    const selectedProduct = this.products.find(product => product.name === this.currentProduct.name);
    
      try {
        const response = await fetch('https://ivm108.informatik.htw-dresden.de/ewa/g01/Beleg/backend/update_stock.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: selectedProduct.id, anzahl: this.newStock }),
        });
        const data = await response.json();
        if (data.success) {
          alert('Lagerbestand wurde erfolgreich aktualisiert!');
          await this.fetchProducts(); 
        } else {
          alert('Fehler beim Aktualisieren: ' + data.message);
        }
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Lagerbestands:', error);
      }
    }
    
  },

    mounted() {
      this.fetchData();
      setInterval(() => {
        this.timestamp = new Date().toLocaleString();
      }, 1000);
  }
});
