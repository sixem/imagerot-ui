import * as imagerot from 'imagerot/browser';

export const Actions = () => {
    const test = () => {
        console.log(imagerot);
        console.log(imagerot.listModes());
    };

    return (
        <div className="">
            <div className="button" onClick={test}>Process image</div>

            <div className="button-set" style={{ marginTop: '10px' }}>
                <div className="button">Export workflow</div>
                <div className="button">Import workflow</div>
            </div>
        </div>
    );
};
