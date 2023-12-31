import { formatCurrency } from "../../utils/helpers";
import PropTypes from "prop-types";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { addItem, getCurrentQuantityById } from "../cart/cartSlice";
import DeleteItem from "../cart/deleteItem";
import UpdateItemQuantity from "../cart/UpdateItemQuantity";

function MenuItem({ pizza }) {
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const dispatch = useDispatch();
  const currentQuantity = useSelector(getCurrentQuantityById(id));

  function handleAddToCart() {
    const cartItem = {
      pizzaId: id,
      name,
      quantity: 1,
      unitPrice,
      totalPrice: 1 * unitPrice,
    };
    dispatch(addItem(cartItem));
  }

  return (
    <li className="flex gap-4 py-2">
      <img
        src={imageUrl}
        alt={name}
        className={`h-24 ${soldOut ? "opacity-70 grayscale" : ""}`}
      />
      <div className="flex flex-col grow">
        <p className="font-medium">{name}</p>
        <p className="text-sm italic text-stone-500 capitalize">
          {ingredients.join(", ")}
        </p>
        <div className="mt-auto flex items-center justify-between">
          {!soldOut ? (
            <p className="text-sm">{formatCurrency(unitPrice)}</p>
          ) : (
            <p className="uppercase text-sm font-medium text-stone-400">
              Sold out
            </p>
          )}
          {!soldOut &&
            (currentQuantity === 0 ? (
              <Button type="small" onClick={handleAddToCart}>
                Add To Cart
              </Button>
            ) : (
              <div className="flex gap-8">
                <UpdateItemQuantity
                  pizzaId={id}
                  currentQuantity={currentQuantity}
                />
                <DeleteItem pizzaId={id} />
              </div>
            ))}
        </div>
      </div>
    </li>
  );
}

MenuItem.propTypes = {
  pizza: PropTypes.object,
};

export default MenuItem;
