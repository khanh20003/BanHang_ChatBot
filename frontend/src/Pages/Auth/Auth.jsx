import React from 'react';
import { Outlet } from 'react-router-dom';

const Auth = () => {

    return (
        <div>
            <Outlet />
            <style>{`
                .input-auth::placeholder {
                    color: #9ca3af;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default Auth;