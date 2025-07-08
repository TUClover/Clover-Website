const NoData = () => {
  return (
    <div className="flex flex-1 justify-center pt-24">
      <div className="text-center card">
        <h2 className="text-lg font-semibold text mb-4">No activity found</h2>
        <p className="text-gray-500">
          It seems you haven't accepted any suggestions yet. Start coding to see
          your progress here!
        </p>
        <a
          href="https://clover.nickrucinski.com/download"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-400 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-700 hover:scale-105 text-white font-bold py-2 px-4 rounded transition-all"
        >
          Download CLOVER
        </a>
      </div>
    </div>
  );
};

export default NoData;

// <div className="flex justify-center mt-10">
//   <div className="text-center p-6 border rounded-lg">
//     <h2 className="text-lg font-semibold text mb-4">
//       No Activity Found
//     </h2>
//     <p className="text-muted-foreground">
//       You have not created any classes yet. Please create a class to
//       view activity and insights.
//     </p>
//   </div>
// </div>
