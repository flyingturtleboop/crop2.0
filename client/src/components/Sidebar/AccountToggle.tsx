
export const AccountToggle = () => {
  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button className="flex p-0.5 hover:bg-green-200 rounded transition-colors relative gap-2 w-full items-center">
        <img
          src="https://api.dicebear.com/9.x/notionists/svg"
          alt="avatar"
          className="size-8 rounded-full shrink-0 bg-green-500 shadow-md"
        />
        <div className="text-start">
          <span className="text-sm font-bold block">Tom Is Loading</span>
          <span className="text-xs block text-stone-500">tom@hover.dev</span>
        </div>
      </button>
    </div>
  );
};