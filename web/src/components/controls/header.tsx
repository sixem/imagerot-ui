import { Tooltip } from '@/components';
import { Github } from '@/icons/';

const Header = () => {
    return (
        <div className="header">
            <h2>ImageRot UI</h2>
            <div className="git">
                <Tooltip text="Check out the project on GitHub!">
                    <a target="_blank" rel="noreferrer" href={__APP_HOMEPAGE__}><Github /></a>
                </Tooltip>
            </div>
        </div>
    );
};

export { Header };
