import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddress } from "../user/userSlice";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { useState } from "react";
import { formatCurrency } from "../../utils/helpers";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str
  );

function CreateOrder() {
  const [priority, setPriority] = useState(false);
  const dispatch = useDispatch();
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const navigation = useNavigation();
  const formError = useActionData();
  const isSubmitting = navigation.state === "submitting";
  const {
    username,
    status,
    address,
    position,
    error: addressError,
  } = useSelector((state) => state.user);
  const isLoadingAddress = status === "loading";
  const priorityPrice = priority ? totalCartPrice * 0.2 : 0;

  if (cart.length === 0) return <EmptyCart />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-8">Ready to order? Lets go!</h2>

      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow"
            type="text"
            name="customer"
            defaultValue={username}
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {formError?.phone && (
              <p className="text-sm mt-2 text-red-700 bg-red-100 rounded-md p-2">
                {formError.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center relative">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              required
              defaultValue={address}
              disabled={isLoadingAddress}
            />
            {status === "error" && (
              <p className="text-sm mt-2 text-red-700 bg-red-100 rounded-md p-2">
                {addressError}
              </p>
            )}
          </div>
          {!position.longitude && !position.latitude && (
            <span className="absolute right-[3px] z-50 top-[3px]">
              <Button
                type="small"
                disabled={isLoadingAddress}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                Get Position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex gap-5 items-center">
          <input
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-500
          focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <input type="hidden" name="cart" value={JSON.stringify(cart)} />
        <input
          type="hidden"
          name="position"
          value={
            position.latitude && position.longitude
              ? `${position.latitude}, ${position.longitude}`
              : ""
          }
        />

        <div>
          <Button type="primary" disabled={isSubmitting || isLoadingAddress}>
            {isSubmitting
              ? "Placing Order ..."
              : `Order now for ${formatCurrency(
                  totalCartPrice + priorityPrice
                )}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  };

  const errors = {};
  if (!isValidPhone(data.phone))
    errors.phone =
      "Please give us your correct phone number. We might need it to contact you.";

  if (Object.keys(errors).length > 0) return errors;

  const newOrder = await createOrder(order);

  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
