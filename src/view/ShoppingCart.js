import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { VariablesContext } from "../context/ContextStorage";
import myfirebase from "../firebase";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  image: {
    maxWidth: 150,
    height: 150,
  },
  prodDetails: {
    color: "white",
    backgroundColor: "green",
    borderRadius: 5,
    padding: "2px 10px ",
    textTransform: "uppercase",
    textDecoration: "none",
    "&:hover": {
      color: "black",
      brigthness: "0.5",
    },
  },
  buttonRemove: {
    color: "white",
    backgroundColor: "red",
    borderRadius: 5,
    padding: 5,
    textTransform: "uppercase",
    textDecoration: "none",
    "&:hover": {
      color: "black",
    },
  },
}));
function ShoppingCart() {
  const classes = useStyles();
  const db = myfirebase.firestore();
  const { user} = useContext(AuthContext);
  const {
    docProduct,
    setDocProduct,
    idProductArray,
    setIdProductArray,
    setPriceCart,
  } = useContext(VariablesContext);
  const [quantityUser, setQuantityUser] = useState(null);
  const [filtered, setFiltered] = useState([]);

  console.log("OutshoppingCartProd", docProduct);
  useEffect(() => {
    console.log("totdoc pre filter", docProduct);
    let arrayShopProd = [];
    if (user) {
      db.collection("shopping")
        .where("uid", "==", user.uid)
        .get()
        .then((querySnapshot) => {
          let arrayPrice = [];
          let arrayId = [];
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            //   console.log(doc.id, " => ", doc.data());
            // console.log("intern", doc.data());

            let docData = doc.data();
            let docDataProd = docData;
            let priceProd = docDataProd.product.price;
            //   console.log("price", priceI);
            //Product id
            let idProd = docData.product.id;
            //  console.log("id", idProd);
            arrayId.push(idProd);
            //  console.log("idlist", arrayId);
            //Product Price
            arrayPrice.push(Number(priceProd));

            arrayShopProd.push(docData);
          });
          console.log("docData", arrayShopProd);
          setDocProduct(arrayShopProd);
          setPriceCart(arrayPrice);
          setIdProductArray(arrayId);
          console.log("doc", docProduct);
          // setIdProductArray(arrayId);
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }, []);
  useEffect(() => {
    //Object with quantity
    var objectKeyValue = idProductArray.reduce(function (acc, curr) {
      if (typeof acc[curr] == "undefined") {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }

      return acc;
    }, {});
    setQuantityUser(objectKeyValue);
    console.log("quantity", objectKeyValue);
  }, [idProductArray]);

  useEffect(() => {
    //Array with unique elements
    if (docProduct) {
      var filteredA = docProduct.reduce((unique, o) => {
        if (!unique.some((obj) => obj.product.title === o.product.title)) {
          unique.push(o);
        }
        return unique;
      }, []);

      console.log("filt", filteredA);
      setFiltered(filteredA);
    }
  }, [docProduct]);
  //Remove Product
  useEffect(() => {
    removeProductFirebase();
  }, [idProductArray]);

  let removeProductFirebase = (id, title, prodId) => {
    db.collection("shopping")
      .doc(id)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
        console.log(id);
      })
      .then(() => {
        let indexToRemove = docProduct.findIndex((elem, index) => {
          return elem.product.title === title;
        });
        docProduct.splice(indexToRemove, 1);
        setDocProduct(docProduct);

        if (quantityUser) {
          if (quantityUser.hasOwnProperty(prodId)) {
            setQuantityUser({
              ...quantityUser,
              [prodId]: (quantityUser[prodId] -= 1),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  };
  console.log("shoppingCartProd", docProduct);

  const refreshPage = () => {
    window.location.reload();
  };
  function twoFunctionsRemove(id, title, prodId) {
    removeProductFirebase(id, title, prodId);
   
    refreshPage();
  }


 
  if (docProduct && quantityUser) {
    return filtered.map((prod) => {
    
      return (
        <div className={classes.root} name={prod.title}>
          <Paper className={classes.paper}>
            <Grid
              container
              direction="row"
              justify="space-around"
              alignItems="center"
              xs={12}
            >
              <img
                xs={6}
                src={prod.product.image}
                alt="picture"
                className={classes.image}
              />
              <Grid items xs={6}>
                <p style={{ fontWeight: 900 }}>{prod.product.title}</p>

                <p>
                  {quantityUser[prod.product.id]} x {prod.product.price} $
                </p>

                <p>Id : {prod.product.id}</p>
              </Grid>
              <Grid
                xs={12}
                items
                style={{
                  display: "flex",
                  margin: 10,
                  justifyContent: "center",
                }}
              >
                <button
                  className={classes.buttonRemove}
                  style={{ margin: 15 }}
                  onClick={() => {
                    twoFunctionsRemove(
                      prod.docId,
                      prod.product.title,
                      prod.product.id
                    );
                  }}
                >
                  Remove
                </button>
                <Link
                  to={`detail/${prod.product.id}`}
                  className={classes.prodDetails}
                >
                  <p size="small" style={{ margin: 15 }}></p> Product details
                </Link>
              </Grid>
            </Grid>
          </Paper>
        </div>
      );
    });
  } else {
    return <p>No products selected</p>;
  }
}
export default ShoppingCart;
