## Introduction

This work is done by both [Adrian Lee Jun Wei (git2467)](https://github.com/git2467) and [Ang Guang En (guangen96)](https://github.com/guangen96).

This is a React.js frontend project for our Health App that:

- allows users to find and track their food nutritional intake against the recommended guidelines

The backend project can be found [here](https://github.com/git2467/HealthApp-Engine).

## Features

### 1. Default View

Default page showing a `Login` button, `Search Bar`, `Sign-in` prompt and a blurred `Food Diary`.

![](/public/readme/default-view.png)

### 2. Food Nutrition Database

User can use the `Search Bar` to search for food item. The results will be displayed in the form of `Chip`.

Upon clicking a `Chip`, the nutritional breakdown of a selected food item will be shown.

![](/public/readme/food-nutrition-database.png)

### 3. Food Diary

#### 3.1 Login

User required to login for access to personal food diary.

<video src="https://github.com/user-attachments/assets/60b2cddf-9dce-4b04-8518-d81e015ad4d0" autoplay muted loop controls></video>

#### 3.2 Adding to Food Diary

By clicking `Add to Diary` button, user can add a food entry to his/her personal food diary.

![add to diary](/public/readme/add-to-diary.png)

#### 3.3 Food Entries Table

User can:

- `View` food entries and their nutritional information, by date
- `Edit` food entries' serving quantity and size
- `Delete` food entries

![diary table](/public/readme/diary-table.png)

#### 3.4 Recommended Intake Table

User can view:

- daily total nutrients intake
- daily recommended nutrients intake, by age
- daily remaining nutrients intake to hit recommended (rcmd - total)

![header age selection](/public/readme/header-age-selection.png)
![total table](/public/readme/total-table.png)

## Technical Implementations

### React Javascript

`React hooks` - manage component states (ie. useState, useEffect, useRef, useContext)

`Modular Design` - making components reusable
```javascript
// Reusable table component
function Table(columns, rows(or groupedRows), onDelete...) {
  ...
  return (
    <TableContainer>
      <MuiTable>
        <TableHead></TableHead>
        <TableBody>
          <TableRow>
            Reusability #1
            if (rows){
              //render normal rows for individual data entries
            }else if(groupedRows){
              //render groupedRows for grouped data entries
            }
            
            Reusability #2
            <TableCell>
              {column.type === "input" ? (
                //Input textfield component
              ) : column.type === "select" ? (
                //Select component
              ) : (
                //Plaintext
              )
              }
            </TableCell>
            
            Reusability #3
            if(onDelete){
              //render delete icon cell
            }
          </TableRow>
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}
```
`Authentication` - using Keycloak (ie. login, logout, refresh and validate authentication token's expiry)

`Session cookies` - secure way of storing authentication tokens
```javascript
export const login = async (code) => {
  try {
    const response = await axios.post(
      "/realms/healthapp/protocol/openid-connect/token",
      new URLSearchParams({
        ...
        redirect_uri: "http://localhost:3000/redirect",
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
      }), ...
    );

    const accessToken = response.data.access_token;
    document.cookie = `accessToken=${accessToken}; path=/; Secure; SameSite=Strict; max-age=86400;`;
    const decodedToken = jwtDecode(accessToken);
    ...

    setTokenInAxios(accessToken); //attach to axios instance
    console.log("Logged in successfully.");
    return decodedToken;
  } catch (error) {
    console.error("Error logging in: ", error);
    throw error;
  }
};
```

`Axios` - manage asnyc HTTP requests, responses to: [FoodData Central database](https://fdc.nal.usda.gov/download-datasets), Food Diary PostgreSQL database, Keycloak

`Axios interceptor` - to handle 401 Unauthorized errors
```javascript
engineAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (!getCookie("accessToken")) {
        await logout();
        return Promise.reject(error);
      } else {
        await relogin();
        return engineAxiosInstance.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

`Debouncing` - delay execution of event handlers for performance optimization

`Business logic` - calculation of nutrients amount
```javascript
const calculateFoodNutrients = (nutrients, servingSizeGramValue, servingQty) => {
  const foodNutrients = nutrients.map((nutrient) => ({
    amount: ((nutrient.amount * servingSizeGramValue) / 100) * servingQty,
  }));
  };

const calculateRemaining = (totals) => {
  const remaining = {
    energy:
      recommendedNutrients.find(
        (recommended) => recommended.name === "Energy"
      )?.recommendedAmt - totals.energy,
    ...
  }}
```

### CSS

`Material UI components` - [popular React-based UI library](https://mui.com/material-ui/all-components/) 

`Global styling` - consistency in design, by applying unified global styles across components

```scss
$primary-color: #5D796F;

header {
  background-color: $primary-color;
}

.header-select {
  background-color: $primary-color;
}
```

`Component styling` - custom styling of individual components (ie. states, layout, interactive effects)

```scss
.primary-button.login-button {
  background-color: $color-4;
  color: white;
}

.primary-button.login-button:hover {
  opacity: 0.8;
}

.nutrition-display-form .MuiDialogContent-root .MuiGrid-item {
  padding: 0px;
  margin-top: 24px;
  display: flex;
  justify-content: left;
  align-items: center;
}
```
