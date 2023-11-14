
<h1 align="center">
VINTED Backend

</h1>

</br>

<p align="center">
	<img alt="Last Commit" src="https://img.shields.io/github/last-commit/ErwanPel/Vinted-Backend.svg?style=flat-square">
	<img alt="Licence" src="https://img.shields.io/github/license/ErwanPel/Vinted-Backend.svg?style=flat-square">
	<img alt="Star" src="https://img.shields.io/badge/you%20like%20%3F-STAR%20ME-blue.svg?style=flat-square">
</p>


## Tech Stack

[**Client:**](https://github.com/ErwanPel/Vinted-frontend) React.js

**Server:** Node.js, Express.js, MongoDB

## Overview

This replica of Vinted is the guiding thread project carried out during the "Le Réacteur" bootcamp. It allows you to understand the basic structure of an e-commerce site, from the creation of a user to the presentation of offers and payment.

This project manages 11 routes for :

1) user registration and connection.
2) consultation of all offers, or of a specific offer.
3) publication, modification and deletion of a user's offer.
4) Pay for an offer via Stripe.
5) View the user's purchases/sales.
6) Automated e-mail notification of user creation to an administrator.

</br>

This project enables images to be uploaded to cloudinary using the express-fileupload and cloudinary packages.
The Stripe API is used for payment management.
The Mailgun.js and form-data APIs are used to send automated e-mails.
An "isAuthenticated" middleware ensures the security of routes requiring connection.




## Installation and usage

Be sure, you have installed Node.js : [Node.js](https://nodejs.org/en). You have to install the "LTS" version.

### Running the project

Clone this repository :

```
git clone https://github.com/ErwanPel/Vinted-Backend.git
cd Vinted-Backend
```

Install packages :

```
npm install

```

When installation is complete, you have to launch  :

```
npx nodemon index.js

```

You can test different server routes with software such as [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/).

You can see the client side for this Vinted Project [here](https://github.com/ErwanPel/Vinted-frontend).

## Star, Fork, Clone & Contribute

Feel free to contribute on this repository. If my work helps you, please give me back with a star. This means a lot to me and keeps me going!
