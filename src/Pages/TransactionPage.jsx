import TransactionForm from "../components/TransactionForm";
// import TransactionList from "../components/TransactionList";


function TransactionPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <TransactionForm />
      {/* <TransactionList /> */}
      
    </div>
  );
}

export default TransactionPage;