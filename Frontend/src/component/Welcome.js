import React from 'react';

class Welcome extends React.Component {
    render() {
        return (
            <div className={"d-flex align-items-center justify-content-center"}
                 style={{height: "90vh"}}
            >
                <div style={{textAlign: "center"}}>
                    <h1>
                        MicroProject
                    </h1>
                    <br/>
                    <h2>The next generation of project managers.</h2>
                </div>
            </div>
        );
    }
}

export default Welcome;