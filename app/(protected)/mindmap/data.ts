export const mindMapData: 
    { 
        id: string, 
        label: string, 
        children: string[], 
        explanation?: string,
        metadata?: { 
                    color: string, 
                    icon: string 
                }, 
                parent_id?: string 
    }[] = [
      {
        id: "1",
        label: "React",
        children: ["2", "3"],
        explanation: "A JavaScript library for building user interfaces",
        metadata: { color: "#61dafb", icon: "react" },
      },
      {
        id: "2",
        label: "Components",
        children: ["4", "5"],
        explanation: "Independent, reusable UI pieces in React",
        metadata: { color: "#ff8c00", icon: "layers" },
        parent_id: "1",
      },
      {
        id: "3",
        label: "Hooks",
        children: ["6", "7", "8"],
        explanation: "Functions that let you use state and other React features",
        metadata: { color: "#32cd32", icon: "hook" },
        parent_id: "1",
      },
      {
        id: "4",
        label: "Function Component",
        children: [],
        explanation: "A component defined as a function that returns JSX",
        metadata: { color: "#4682b4", icon: "function" },
        parent_id: "2",
      },
      {
        id: "5",
        label: "Class Component",
        children: [],
        explanation: "A component defined as a class extending React.Component",
        metadata: { color: "#8a2be2", icon: "class" },
        parent_id: "2",
      },
      {
        id: "6",
        label: "useState",
        children: [],
        explanation: "Hook that lets you add state to function components",
        metadata: { color: "#20b2aa", icon: "state" },
        parent_id: "3",
      },
      {
        id: "7",
        label: "useEffect",
        children: [],
        explanation: "Hook for performing side effects in components",
        metadata: { color: "#d2691e", icon: "effect" },
        parent_id: "3",
      },
      {
        id: "8",
        label: "useContext",
        children: [],
        explanation: "Hook for consuming values from React Context",
        metadata: { color: "#dc143c", icon: "context" },
        parent_id: "3",
      },
    ];
    