
import React from 'react';
import { InfoItem, InfoItemProps } from './InfoItem';

interface InfoSectionProps {
  title: string;
  items: Omit<InfoItemProps, 'children'>[];
}

export const InfoSection: React.FC<InfoSectionProps> = ({ title, items }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
        {items.map((item, index) => (
          <InfoItem
            key={index}
            label={item.label}
            value={item.value}
            icon={item.icon}
            highlight={item.highlight}
          />
        ))}
      </div>
    </div>
  );
};
