const Logo = ({ className = "" }) => {
    return (
        <div className={"flex items-center gap-1 " + className}>
            <h1 className={"font-bold tracking-tight" + className}>
        <span
            className={
                "bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-400"
            }
        >
          Travel
        </span>
                <span className="ml-1 font-light italic text-violet-600">
          Assist
        </span>
            </h1>
        </div>
    );
};

export default Logo;
