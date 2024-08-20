import React from 'react';
import Button from './Button/Button';

const data = [
  { id: 1, name: 'Item 1', value: 100 },
  { id: 2, name: 'Item 2', value: 200 },
  { id: 3, name: 'Item 3', value: 300 },
];

const MainContent = () => {
  const handleButtonClick = () => {
    alert('Button clicked!');
  };

  return (
    <main>
      <h2>Dashboard Content</h2>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
      <Button onClick={handleButtonClick}>Click Me</Button>
    </main>
  );
};

export default MainContent;