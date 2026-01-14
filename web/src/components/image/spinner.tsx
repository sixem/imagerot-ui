const Spinner = ({ visible }: { visible: boolean; }) => {
    return (
        <div className={"spinner" + (visible ? " visible" : "")}>
            <div className="icon" />
        </div>
    );
};

export { Spinner };
