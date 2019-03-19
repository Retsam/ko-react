import React, { useRef } from 'react';
import useKnockoutBindings from 'reactToKnockout/useKnockoutBindings';

export interface KnockoutTemplateProps {
    name: string;
    data?: any;
}
const KnockoutTemplate = ({
    name,
    data = {},
}: KnockoutTemplateProps) => {
    const elRef = useRef<HTMLDivElement>(null);

    useKnockoutBindings(elRef, {
        name,
        data,
    });

    return <div ref={elRef} data-bind="template: {
        name: name,
        data: data
    }" />;
};

export default KnockoutTemplate;
