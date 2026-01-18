import type { TWorkflowPreset } from '@/data/types';

import { countItems, formatCount } from './utils';

type TPresetListProps = {
    presets: TWorkflowPreset[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

const PresetList = ({ presets, selectedId, onSelect }: TPresetListProps) => {
    return (
        <div className="presets-panel presets-list">
            <div className="panel-header">
                <div className="title">Presets</div>
                <div className="meta">{presets.length}</div>
            </div>
            <div className="panel-body">
                {presets.length > 0 ? (
                    presets.map((preset) => {
                        const counts = countItems(preset.items);
                        return (
                            <div
                                key={preset.id}
                                className={`preset-row${selectedId === preset.id ? ' selected' : ''}`}
                                onClick={() => onSelect(preset.id)}
                            >
                                <div className="name">{preset.name}</div>
                                <div className="meta">
                                    {formatCount(counts.effects, 'effect')}
                                    {' - '}
                                    {formatCount(counts.modes, 'mode')}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="preset-empty">
                        No presets saved yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export { PresetList };
