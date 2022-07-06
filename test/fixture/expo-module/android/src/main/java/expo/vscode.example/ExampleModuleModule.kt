package expo.vscode.example

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExampleModuleModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExampleModule")

    AsyncFunction("helloAsync") { options: Map<String, String> ->
      println("Hello 👋")
    }

    ViewManager {
      View { context -> 
        ExampleModuleView(context) 
      }

      Prop("name") { view: ExampleModuleView, prop: String ->
        println(prop)
      }
    }
  }
}
