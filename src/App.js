import { useState } from "react";

// These are the friends that appear when the app first loads.
const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

// A reusable button component so we don't have to write the same button code multiple times.
function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  // Keep track of the friends, whether the add-friend form is open, and which friend is selected.
  const [friends, setFriends] = useState(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Show or hide the form for adding a new friend.
  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  // Add the new friend to the list and close the form.
  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  // Select a friend to split a bill with, or deselect them if they are already selected.
  function handleSelection(friend) {
    // setSelectedFriend(friend);
    setSelectedFriend((cur) => (cur?.id === friend.id ? null : friend));
    setShowAddFriend(false);
  }

  // Update the selected friend's balance after splitting a bill.
  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );

    // Close the split-bill form after updating the balance.
    setSelectedFriend(null);
  }

  return (

    <div className="app">
      <h1>LET'S SPLIT THE BILLS</h1>
      <div className="sidebar">
        {/* Display the list of friends and handle friend selection. */}
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection}
        />

        {/* Only show the form when the user wants to add a friend. */}
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}

        {/* Toggle between opening and closing the add-friend form. */}
        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add friend"}
        </Button>
      </div>

      {/* Show the split-bill form only when a friend is selected. */}
      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
          key={selectedFriend.id}
        />
      )}
    </div>
  );
}

// This component displays all the friends by creating a Friend component for each one.
function FriendsList({ friends, onSelection, selectedFriend }) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          key={friend.id}
          selectedFriend={selectedFriend}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}

// Display a friend's information and show how much money you owe them or they owe you.
function Friend({ friend, onSelection, selectedFriend }) {
  // Check if this is the friend currently selected by the user.
  const isSelected = selectedFriend?.id === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {/* A negative balance means you still owe this friend money. */}
      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} {Math.abs(friend.balance)}€
        </p>
      )}

      {/* A positive balance means this friend owes you money. */}
      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you {Math.abs(friend.balance)}€
        </p>
      )}

      {/* If the balance is zero, neither of you owes the other anything. */}
      {friend.balance === 0 && <p>You and {friend.name} are even</p>}

      {/* Let the user select a friend or close their selection. */}
      <Button onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

// This form allows the user to add a new friend to the list.
function FormAddFriend({ onAddFriend }) {
  // Store the name and image URL entered in the form.
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  function handleSubmit(e) {
    // Prevent the page from reloading when the form is submitted.
    e.preventDefault();

    // Don't add the friend if the name or image URL is missing.
    if (!name || !image) return;

    // Give the new friend a unique ID.
    const id = crypto.randomUUID();

    // Create the new friend with a starting balance of zero.
    const newFriend = {
      id,
      name,
      image: `${image}?=${id}`,
      balance: 0,
    };

    // Send the new friend to the main component so they can be added to the list.
    onAddFriend(newFriend);

    // Clear the form and restore the default image URL.
    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👫 Friend name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>🌄 Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />

      {/* Submit the form to add the new friend. */}
      <Button>Add</Button>
    </form>
  );
}

// This form calculates how to split a bill with the selected friend.
function FormSplitBill({ selectedFriend, onSplitBill }) {
  // Keep track of the total bill, your share, and who pays the bill.
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");

  // Calculate the friend's share by subtracting your expense from the total bill.
  const paidByFriend = bill ? bill - paidByUser : "";

  // By default, you are the one paying the bill.
  const [whoIsPaying, setWhoIsPaying] = useState("user");

  function handleSubmit(e) {
    // Prevent the page from reloading when the form is submitted.
    e.preventDefault();

    // Make sure the bill amount and your expense have been entered.
    if (!bill || !paidByUser) return;

    // Calculate the balance change based on who pays the bill.
    onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <label>💰 Bill value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      />

      <label>🧍‍♀️ Your expense</label>
      <input
        type="text"
        value={paidByUser}
        onChange={(e) =>
          setPaidByUser(
            Number(e.target.value) > bill ? paidByUser : Number(e.target.value)
          )
        }
      />

      <label>👫 {selectedFriend.name}'s expense</label>
      {/* This value is calculated automatically and cannot be edited directly. */}
      <input type="text" disabled value={paidByFriend} />

      <label>🤑 Who is paying the bill</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>

      {/* Submit the bill details and update the friend's balance. */}
      <Button>Split bill</Button>
    </form>
  );
}